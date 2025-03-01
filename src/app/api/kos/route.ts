import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import qs from 'qs';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  try {
    // Krok 1: Získání XSRF-TOKEN
    const loginPageResponse = await axios.get('https://kos.cvut.cz/rest/login', {
      withCredentials: true,
    });

    const cookies = loginPageResponse.headers['set-cookie'];
    if (!cookies) throw new Error('Nepodařilo se získat cookies.');

    const xsrfToken = cookies.find((cookie) => cookie.includes('XSRF-TOKEN'))?.split(';')[0].split('=')[1];
    if (!xsrfToken) throw new Error('Chybějící XSRF token.');

    // Krok 2: Autentizace (POST) - zde se získá JSESSIONID
    const authResponse = await axios.post(
      'https://kos.cvut.cz/rest/login',
      qs.stringify({ username, password }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Xsrf-Token': xsrfToken,
          Cookie: `XSRF-TOKEN=${xsrfToken}`,
        },
        withCredentials: true,
      }
    );

    const authCookies = authResponse.headers['set-cookie'];
    const jsessionId = authCookies?.find((cookie) => cookie.includes('JSESSIONID'))?.split(';')[0].split('=')[1];

    if (!jsessionId) throw new Error('Chybějící JSESSIONID po autentizaci.');

    // Krok 3: Získání dat (GET)
    const surveysResponse = await axios.get('https://kos.cvut.cz/rest/api/surveys', {
      headers: {
        Cookie: `JSESSIONID=${jsessionId}; XSRF-TOKEN=${xsrfToken}`,
      },
      withCredentials: true,
    });

    return NextResponse.json(surveysResponse.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Chyba při zpracování požadavku.' }, { status: 500 });
  }
}
