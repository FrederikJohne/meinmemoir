-- Seed data: Question Library for MeineMemoiren.com
-- 52 questions organized by category for a full year of storytelling

INSERT INTO public.prompts (category, question_de, question_en, question_sv, week_number) VALUES
-- Childhood (weeks 1-8)
('childhood', 'Wo bist du aufgewachsen und wie sah dein Zuhause aus?', 'Where did you grow up and what did your home look like?', 'Var växte du upp och hur såg ditt hem ut?', 1),
('childhood', 'Was ist deine früheste Kindheitserinnerung?', 'What is your earliest childhood memory?', 'Vad är ditt tidigaste barndomsminne?', 2),
('childhood', 'Was waren deine Lieblingsspiele als Kind?', 'What were your favorite games as a child?', 'Vilka var dina favoritlekar som barn?', 3),
('childhood', 'Erzähl von deinem besten Freund oder deiner besten Freundin in der Kindheit.', 'Tell about your best friend in childhood.', 'Berätta om din bästa vän i barndomen.', 4),
('childhood', 'Was war dein Lieblingsessen, das deine Mutter oder dein Vater gekocht hat?', 'What was your favorite meal that your mother or father cooked?', 'Vilken var din favoriträtt som din mamma eller pappa lagade?', 5),
('childhood', 'Wie hast du die Feiertage als Kind erlebt?', 'How did you experience holidays as a child?', 'Hur upplevde du helgdagar som barn?', 6),
('childhood', 'Hattest du ein Haustier? Erzähl davon!', 'Did you have a pet? Tell us about it!', 'Hade du ett husdjur? Berätta om det!', 7),
('childhood', 'Was war der lustigste Streich, den du als Kind gespielt hast?', 'What was the funniest prank you played as a child?', 'Vad var det roligaste spratt du spelade som barn?', 8),

-- School & Youth (weeks 9-16)
('school', 'Wie war deine Schulzeit? Hattest du einen Lieblingslehrer?', 'How was your school time? Did you have a favorite teacher?', 'Hur var din skoltid? Hade du en favoritlärare?', 9),
('school', 'Was wolltest du als Kind werden, wenn du groß bist?', 'What did you want to be when you grew up?', 'Vad ville du bli när du blev stor?', 10),
('school', 'Erzähl von einem besonderen Schulausflug oder einer Klassenfahrt.', 'Tell about a special school trip.', 'Berätta om en speciell skolresa.', 11),
('school', 'Welche Musik hast du als Jugendlicher gehört?', 'What music did you listen to as a teenager?', 'Vilken musik lyssnade du på som tonåring?', 12),
('school', 'Was war dein erster Job oder dein erstes verdientes Geld?', 'What was your first job or first earned money?', 'Vad var ditt första jobb eller dina första tjänade pengar?', 13),
('school', 'Gab es einen Moment in deiner Jugend, der dein Leben verändert hat?', 'Was there a moment in your youth that changed your life?', 'Fanns det ett ögonblick i din ungdom som förändrade ditt liv?', 14),
('school', 'Was war die größte Mode, als du jung warst?', 'What was the biggest fashion trend when you were young?', 'Vilken var den största modetrenden när du var ung?', 15),
('school', 'Erzähl von deiner Abschlussfeier oder dem Ende deiner Schulzeit.', 'Tell about your graduation or the end of school.', 'Berätta om din examen eller slutet av skoltiden.', 16),

-- Career & Work (weeks 17-24)
('career', 'Wie hast du deinen Beruf gewählt?', 'How did you choose your career?', 'Hur valde du din karriär?', 17),
('career', 'Was war dein erster Arbeitstag wie?', 'What was your first day at work like?', 'Hur var din första arbetsdag?', 18),
('career', 'Wer war der wichtigste Mentor in deinem Berufsleben?', 'Who was the most important mentor in your career?', 'Vem var den viktigaste mentorn i din karriär?', 19),
('career', 'Was war deine größte berufliche Herausforderung?', 'What was your biggest professional challenge?', 'Vad var din största professionella utmaning?', 20),
('career', 'Auf welche berufliche Leistung bist du am meisten stolz?', 'What professional achievement are you most proud of?', 'Vilken professionell prestation är du mest stolt över?', 21),
('career', 'Gab es einen lustigen Moment bei der Arbeit, an den du dich erinnerst?', 'Was there a funny moment at work you remember?', 'Finns det ett roligt ögonblick på jobbet som du minns?', 22),
('career', 'Wie hat sich dein Arbeitsplatz über die Jahre verändert?', 'How did your workplace change over the years?', 'Hur förändrades din arbetsplats genom åren?', 23),
('career', 'Was würdest du jungen Menschen über die Arbeitswelt raten?', 'What advice would you give young people about work?', 'Vilka råd skulle du ge unga människor om arbetslivet?', 24),

-- Love & Family (weeks 25-34)
('family', 'Wie hast du deinen Partner / deine Partnerin kennengelernt?', 'How did you meet your partner?', 'Hur träffade du din partner?', 25),
('family', 'Erzähl von eurem ersten Date.', 'Tell about your first date.', 'Berätta om er första dejt.', 26),
('family', 'Wie war eure Hochzeit?', 'What was your wedding like?', 'Hur var ert bröllop?', 27),
('family', 'Was ist das Geheimnis einer langen Beziehung?', 'What is the secret to a long relationship?', 'Vad är hemligheten bakom ett långt förhållande?', 28),
('family', 'Wie hast du erfahren, dass du zum ersten Mal Eltern wirst?', 'How did you find out you were becoming a parent for the first time?', 'Hur fick du reda på att du skulle bli förälder för första gången?', 29),
('family', 'Was war der schönste Moment mit deinen Kindern?', 'What was the most beautiful moment with your children?', 'Vad var det vackraste ögonblicket med dina barn?', 30),
('family', 'Welche Familientradition ist dir am wichtigsten?', 'Which family tradition is most important to you?', 'Vilken familjetradition är viktigast för dig?', 31),
('family', 'Erzähl von einem unvergesslichen Familienurlaub.', 'Tell about an unforgettable family vacation.', 'Berätta om en oförglömlig familjesemester.', 32),
('family', 'Was möchtest du deinen Enkeln mitgeben?', 'What do you want to pass on to your grandchildren?', 'Vad vill du ge vidare till dina barnbarn?', 33),
('family', 'Wie hat sich das Familienleben über die Generationen verändert?', 'How has family life changed across generations?', 'Hur har familjelivet förändrats genom generationerna?', 34),

-- Life Wisdom (weeks 35-42)
('wisdom', 'Was ist die wichtigste Lektion, die das Leben dich gelehrt hat?', 'What is the most important lesson life taught you?', 'Vad är den viktigaste lärdomen livet lärt dig?', 35),
('wisdom', 'Gibt es etwas, das du bereust, oder das du anders machen würdest?', 'Is there anything you regret or would do differently?', 'Finns det något du ångrar eller skulle göra annorlunda?', 36),
('wisdom', 'Wer hat dich am meisten inspiriert und warum?', 'Who inspired you the most and why?', 'Vem har inspirerat dig mest och varför?', 37),
('wisdom', 'Was bedeutet Glück für dich?', 'What does happiness mean to you?', 'Vad betyder lycka för dig?', 38),
('wisdom', 'Welchen Rat würdest du deinem jüngeren Ich geben?', 'What advice would you give your younger self?', 'Vilka råd skulle du ge ditt yngre jag?', 39),
('wisdom', 'Was gibt dir in schwierigen Zeiten Kraft?', 'What gives you strength in difficult times?', 'Vad ger dig styrka i svåra tider?', 40),
('wisdom', 'Wofür bist du am dankbarsten im Leben?', 'What are you most grateful for in life?', 'Vad är du mest tacksam för i livet?', 41),
('wisdom', 'Was ist dein Lebensmotto?', 'What is your life motto?', 'Vad är ditt livsmotto?', 42),

-- Historical Events (weeks 43-48)
('history', 'Welches historische Ereignis hat dich am meisten geprägt?', 'Which historical event shaped you the most?', 'Vilken historisk händelse formade dig mest?', 43),
('history', 'Wie war das Leben vor dem Internet und Smartphones?', 'What was life like before the internet and smartphones?', 'Hur var livet före internet och smartphones?', 44),
('history', 'Erinnerst du dich an den Mauerfall? Wie hast du ihn erlebt?', 'Do you remember the fall of the Berlin Wall? How did you experience it?', 'Minns du Berlinmurens fall? Hur upplevde du det?', 45),
('history', 'Wie hat sich deine Stadt oder dein Dorf über die Jahre verändert?', 'How has your city or village changed over the years?', 'Hur har din stad eller by förändrats genom åren?', 46),
('history', 'Was war die größte Erfindung, die du miterlebt hast?', 'What was the greatest invention you witnessed?', 'Vilken var den största uppfinningen du upplevde?', 47),
('history', 'Wie war der Alltag, als du so alt warst wie deine Enkel jetzt?', 'What was daily life like when you were the age your grandchildren are now?', 'Hur var vardagen när du var lika gammal som dina barnbarn är nu?', 48),

-- Closing & Reflection (weeks 49-52)
('reflection', 'Was macht dich einzigartig?', 'What makes you unique?', 'Vad gör dig unik?', 49),
('reflection', 'Wenn du ein Buch über dein Leben schreiben würdest, wie würde der Titel lauten?', 'If you wrote a book about your life, what would the title be?', 'Om du skrev en bok om ditt liv, vad skulle titeln vara?', 50),
('reflection', 'Gibt es eine Geschichte, die du noch nie jemandem erzählt hast?', 'Is there a story you have never told anyone?', 'Finns det en berättelse du aldrig berättat för någon?', 51),
('reflection', 'Was möchtest du, dass deine Familie für immer über dich weiß?', 'What do you want your family to know about you forever?', 'Vad vill du att din familj alltid ska veta om dig?', 52);
