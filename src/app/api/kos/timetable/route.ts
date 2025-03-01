// /src/app/api/kos/timetable/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import qs from 'qs';
import ICAL from 'ical.js';

export async function POST(req: NextRequest) {
  // Z těla požadavku získáme potřebná data
  const { username, password, semesterId, personId, studyId } = await req.json();

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

    // Konfigurace hlaviček: kromě Cookie přidáme také X-XSRF-Token do hlavičky
    const config = {
      headers: {
        Cookie: `JSESSIONID=${jsessionId}; XSRF-TOKEN=${xsrfToken}`,
        'X-XSRF-Token': xsrfToken,
      },
      withCredentials: true,
    };

    // Načtení rozvrhových dat pro zvolený semestr
    const timetableUrl = `https://kos.cvut.cz/rest/api/timetables/per-semesters?expanded=room.location,parallelClass,parallelClass.teachers,parallelClass.parallelType,courseView,teachers&personId=${personId}&semesterIds=${semesterId}`;
    const timetableResponse = await axios.get(timetableUrl, config);
    const detailedUrl = `https://kos.cvut.cz/rest/api/timetables/detailed?semesterId=${semesterId}`;
    const detailedResponse = await axios.get(detailedUrl, config);
    // Načtení hranic rozvrhu
    const bordersUrl = 'https://kos.cvut.cz/rest/api/timetables/borders';
    const bordersResponse = await axios.get(bordersUrl, config);

    // Načtení ICS dat
    const icsUrl = `https://kos.cvut.cz/rest/api/timetables/to-ics?objectType=S&objectId=${studyId}&semesterId=${semesterId}`;
    const icsResponse = await axios.get(icsUrl, config);

    // Parsování ICS dat pomocí ical.js
    const jcalData = ICAL.parse(icsResponse.data);
    const comp = new ICAL.Component(jcalData);
    const events = comp.getAllSubcomponents('vevent').map((vevent) => new ICAL.Event(vevent));

    // Vytvoření pole objektů s vybranými daty pro každou událost
    const parsedEvents = events.map((event) => ({
      uid: event.uid,
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.startDate ? event.startDate.toJSDate().toISOString() : null,
      end: event.endDate ? event.endDate.toJSDate().toISOString() : null,
    }));

    return NextResponse.json({
      timetable: timetableResponse.data,
      detailed: detailedResponse.data,
      borders: bordersResponse.data,
      ics: parsedEvents,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Chyba při zpracování požadavku.' }, { status: 500 });
  }
}
