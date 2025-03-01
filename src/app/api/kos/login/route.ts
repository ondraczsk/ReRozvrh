// /src/app/api/kos/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import qs from 'qs';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  try {
    // Krok 1: Získání cookies a XSRF tokenu z přihlašovací stránky
    const loginPageResponse = await axios.get('https://kos.cvut.cz/rest/login', {
      withCredentials: true,
    });
    const cookies = loginPageResponse.headers['set-cookie'];
    if (!cookies) throw new Error('Nepodařilo se získat cookies.');
    const xsrfToken = cookies
      .find((cookie) => cookie.includes('XSRF-TOKEN'))
      ?.split(';')[0]
      .split('=')[1];
    if (!xsrfToken) throw new Error('Chybějící XSRF token.');

    // Krok 2: Přihlášení – získání JSESSIONID
    const authResponse = await axios.post(
      'https://kos.cvut.cz/rest/login',
      qs.stringify({ username, password }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Xsrf-Token': xsrfToken,
          'Accept-Language': 'cs',
          // Posíláme XSRF token v cookies
          Cookie: `XSRF-TOKEN=${xsrfToken}`,
        },
        withCredentials: true,
      }
    );
    const authCookies = authResponse.headers['set-cookie'];
    const jsessionId = authCookies
      ?.find((cookie) => cookie.includes('JSESSIONID'))
      ?.split(';')[0]
      .split('=')[1];
    if (!jsessionId) throw new Error('Chybějící JSESSIONID po autentizaci.');

    // Připravíme odpověď – kromě dat z /me nastavíme HTTP-only cookies s tokeny.
    const response = NextResponse.json({ me: authResponse.data });
    /*response.cookies.set('kos_xsrf_token', xsrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    response.cookies.set('kos_jsessionid', jsessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });*/
    return response;
  } catch (error) {
    // Zkontrolujeme, zda se jedná o AxiosError a jestli obsahuje response.data
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data as {
        errors?: Array<{ message: string; code: string }>;
      };

      if (data.errors && data.errors.length > 0) {
        // Pokud se vrátí konkrétní kód, můžeme jej mapovat na vlastní zprávu
        const err = data.errors[0];
        const message =
          err.code === 'login.bad.credentials'
            ? 'KOS: ' + err.message + "."
            : err.code === "exception.unauthorized" ? "KOS: Neoprávněný přístup. Kontaktujte správce." : err.message;

        return NextResponse.json({ error: message }, { status: error.response.status });
      }
    }

    // Výchozí zpracování chyb
    return NextResponse.json(
      { error: 'Chyba při zpracování požadavku.' },
      { status: 500 }
    );
  }
}
