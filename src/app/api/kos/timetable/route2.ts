import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import qs from 'qs';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
/*
    ZÍSKAT AKTUÁLNÍ SEMESTR /ME
    využít 
https://kos.cvut.cz/rest/api/timetables/borders

*/

  try {
    // Krok 1: Získání cookies
    const loginPageResponse = await axios.get('https://kos.cvut.cz/rest/login', {
      withCredentials: true,
    });
    const cookies = loginPageResponse.headers['set-cookie'];
    if (!cookies) throw new Error('Nepodařilo se získat cookies.');

    const xsrfToken = cookies.find((cookie) => cookie.includes('XSRF-TOKEN'))?.split(';')[0].split('=')[1];
   if (!xsrfToken) throw new Error('Chybějící XSRF token.');

    // Krok 2: Přihlášení
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

    // Konfigurace hlaviček pro další požadavky
    const config = {
      headers: {
        Cookie: `JSESSIONID=${jsessionId}; XSRF-TOKEN=${xsrfToken}`,
      },
      withCredentials: true,
    };

    // Krok 3: Načtení dat z jednotlivých endpointů

    // Endpoint 1: Per Semesters
    const perSemestersUrl =
      'https://kos.cvut.cz/rest/api/timetables/per-semesters?expanded=room.location%2CparallelClass%2CparallelClass.teachers%2CparallelClass.parallelType%2CcourseView%2Cteachers&personId=22658706&semesterIds=B242';
    const perSemestersResponse = await axios.get(perSemestersUrl, config);

    // Endpoint 2: Courses Without Timetable
    const coursesWithoutTimetableUrl =
      'https://kos.cvut.cz/rest/api/timetables/courses-without-timetable/students?expanded=registeredCourse&personId=22658706&semesterId=B242';
    const coursesWithoutTimetableResponse = await axios.get(coursesWithoutTimetableUrl, config);

    // Endpoint 3: Detailed timetable
    const detailedUrl = 'https://kos.cvut.cz/rest/api/timetables/detailed?semesterId=B242';
    const detailedResponse = await axios.get(detailedUrl, config);
    // Nový Endpoint: Timetable borders
    const bordersUrl = 'https://kos.cvut.cz/rest/api/timetables/borders';
    const bordersResponse = await axios.get(bordersUrl, config);
    // Nový Endpoint: Me
    const meUrl = 'https://kos.cvut.cz/rest/api/me';
    const meResponse = await axios.get(meUrl, config);
    return NextResponse.json({
      perSemesters: perSemestersResponse.data,
      coursesWithoutTimetable: coursesWithoutTimetableResponse.data,
      detailed: detailedResponse.data,
      borders: bordersResponse.data,
      me: meResponse.data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Chyba při zpracování požadavku.' }, { status: 500 });
  }
}
