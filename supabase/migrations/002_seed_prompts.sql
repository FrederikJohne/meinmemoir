-- Seed the prompts table with 52 weeks of questions across categories
INSERT INTO prompts (category, question_de, question_en, question_sv, week_number) VALUES
-- Childhood (Weeks 1-10)
('childhood', 'Was ist deine früheste Kindheitserinnerung?', 'What is your earliest childhood memory?', 'Vad är ditt tidigaste barndomsminne?', 1),
('childhood', 'Wo bist du aufgewachsen und wie war es dort?', 'Where did you grow up and what was it like?', 'Var växte du upp och hur var det där?', 2),
('childhood', 'Was war dein Lieblingsspiel als Kind?', 'What was your favorite game as a child?', 'Vad var din favoritlek som barn?', 3),
('childhood', 'Erzähle von deinem besten Freund oder deiner besten Freundin als Kind.', 'Tell us about your best friend as a child.', 'Berätta om din bästa vän som barn.', 4),
('childhood', 'Was war dein Lieblingsessen, als du klein warst?', 'What was your favorite food when you were little?', 'Vad var din favoritmat när du var liten?', 5),
('childhood', 'Hattest du Haustiere? Erzähle davon!', 'Did you have pets? Tell us about them!', 'Hade du husdjur? Berätta om dem!', 6),
('childhood', 'Was war der lustigste Streich, den du als Kind gespielt hast?', 'What was the funniest prank you played as a child?', 'Vad var det roligaste spratt du spelade som barn?', 7),
('childhood', 'Wie sah ein typischer Tag in deiner Kindheit aus?', 'What did a typical day look like in your childhood?', 'Hur såg en typisk dag ut i din barndom?', 8),
('childhood', 'Was hast du in den Sommerferien gemacht?', 'What did you do during summer holidays?', 'Vad gjorde du under sommarlovet?', 9),
('childhood', 'Gab es einen Ort, an den du als Kind immer wieder zurückkehren wolltest?', 'Was there a place you always wanted to return to as a child?', 'Fanns det en plats du alltid ville återvända till som barn?', 10),

-- Family (Weeks 11-20)
('family', 'Erzähle von deinen Eltern. Wie waren sie?', 'Tell us about your parents. What were they like?', 'Berätta om dina föräldrar. Hur var de?', 11),
('family', 'Hast du Geschwister? Erzähle eine Geschichte über euch zusammen.', 'Do you have siblings? Tell a story about you together.', 'Har du syskon? Berätta en historia om er tillsammans.', 12),
('family', 'Was war die wichtigste Lektion, die dir deine Eltern beigebracht haben?', 'What was the most important lesson your parents taught you?', 'Vad var den viktigaste lärdomen dina föräldrar lärde dig?', 13),
('family', 'Erzähle von deinen Großeltern.', 'Tell us about your grandparents.', 'Berätta om dina morföräldrar/farföräldrar.', 14),
('family', 'Welche Familientraditionen waren dir besonders wichtig?', 'Which family traditions were particularly important to you?', 'Vilka familjetraditioner var särskilt viktiga för dig?', 15),
('family', 'Wie hast du deinen Partner / deine Partnerin kennengelernt?', 'How did you meet your partner?', 'Hur träffade du din partner?', 16),
('family', 'Was war der schönste Familienurlaub, den ihr zusammen hattet?', 'What was the best family vacation you had together?', 'Vad var den bästa familjesemestern ni hade tillsammans?', 17),
('family', 'Erzähle von der Geburt deiner Kinder.', 'Tell us about the birth of your children.', 'Berätta om dina barns födelse.', 18),
('family', 'Was möchtest du deinen Enkeln über die Familie erzählen?', 'What would you like to tell your grandchildren about the family?', 'Vad vill du berätta för dina barnbarn om familjen?', 19),
('family', 'Gibt es ein Familienrezept, das von Generation zu Generation weitergegeben wurde?', 'Is there a family recipe passed down through generations?', 'Finns det ett familjerecept som gått i arv genom generationer?', 20),

-- Career & Education (Weeks 21-30)
('career', 'Was war dein erster Job?', 'What was your first job?', 'Vad var ditt första jobb?', 21),
('career', 'Was wolltest du als Kind werden?', 'What did you want to be when you grew up?', 'Vad ville du bli när du var liten?', 22),
('career', 'Erzähle von deinem Berufsleben. Was hat dir am meisten Spaß gemacht?', 'Tell us about your career. What did you enjoy most?', 'Berätta om ditt yrkesliv. Vad tyckte du mest om?', 23),
('career', 'Wer war dein wichtigster Mentor oder Vorbild?', 'Who was your most important mentor or role model?', 'Vem var din viktigaste mentor eller förebild?', 24),
('career', 'Was war die größte Herausforderung in deinem Berufsleben?', 'What was the biggest challenge in your career?', 'Vad var den största utmaningen i ditt yrkesliv?', 25),
('career', 'Wie war deine Schulzeit?', 'What was your school time like?', 'Hur var din skoltid?', 26),
('career', 'Hattest du einen Lieblingslehrer? Erzähle davon!', 'Did you have a favorite teacher? Tell us about them!', 'Hade du en favoritlärare? Berätta om dem!', 27),
('career', 'Welchen Rat würdest du jungen Menschen zum Thema Arbeit geben?', 'What advice would you give young people about work?', 'Vilket råd skulle du ge unga människor om arbete?', 28),
('career', 'Gab es einen Wendepunkt in deiner Karriere?', 'Was there a turning point in your career?', 'Fanns det en vändpunkt i din karriär?', 29),
('career', 'Was war dein stolzester beruflicher Moment?', 'What was your proudest professional moment?', 'Vad var ditt stoltaste professionella ögonblick?', 30),

-- Life Events (Weeks 31-40)
('life_events', 'Was war der glücklichste Tag deines Lebens?', 'What was the happiest day of your life?', 'Vad var den lyckligaste dagen i ditt liv?', 31),
('life_events', 'Erzähle von deiner Hochzeit.', 'Tell us about your wedding.', 'Berätta om ditt bröllop.', 32),
('life_events', 'Welches historische Ereignis hat dein Leben am meisten beeinflusst?', 'Which historical event influenced your life the most?', 'Vilken historisk händelse påverkade ditt liv mest?', 33),
('life_events', 'Was war das größte Abenteuer deines Lebens?', 'What was the greatest adventure of your life?', 'Vad var det största äventyret i ditt liv?', 34),
('life_events', 'Gibt es etwas, das du bereust, nicht getan zu haben?', 'Is there something you regret not doing?', 'Finns det något du ångrar att du inte gjorde?', 35),
('life_events', 'Was war die mutigste Entscheidung deines Lebens?', 'What was the bravest decision of your life?', 'Vad var det modigaste beslutet i ditt liv?', 36),
('life_events', 'Erzähle von einem Moment, der dein Leben verändert hat.', 'Tell us about a moment that changed your life.', 'Berätta om ett ögonblick som förändrade ditt liv.', 37),
('life_events', 'Was ist dein Lieblingsort auf der Welt?', 'What is your favorite place in the world?', 'Vad är din favoritplats i världen?', 38),
('life_events', 'Was war dein erstes Auto?', 'What was your first car?', 'Vad var din första bil?', 39),
('life_events', 'Erzähle von einem unvergesslichen Weihnachtsfest.', 'Tell us about an unforgettable Christmas.', 'Berätta om en oförglömlig jul.', 40),

-- Wisdom & Reflections (Weeks 41-52)
('wisdom', 'Was ist das Wichtigste, das du im Leben gelernt hast?', 'What is the most important thing you have learned in life?', 'Vad är det viktigaste du har lärt dig i livet?', 41),
('wisdom', 'Welchen Rat würdest du deinem jüngeren Ich geben?', 'What advice would you give your younger self?', 'Vilket råd skulle du ge ditt yngre jag?', 42),
('wisdom', 'Was bedeutet Glück für dich?', 'What does happiness mean to you?', 'Vad betyder lycka för dig?', 43),
('wisdom', 'Was ist dein größter Stolz?', 'What are you most proud of?', 'Vad är du mest stolt över?', 44),
('wisdom', 'Welche Werte sind dir am wichtigsten?', 'Which values are most important to you?', 'Vilka värderingar är viktigast för dig?', 45),
('wisdom', 'Was hat sich in der Welt am meisten verändert, seit du jung warst?', 'What has changed the most in the world since you were young?', 'Vad har förändrats mest i världen sedan du var ung?', 46),
('wisdom', 'Hast du ein Lebensmotto?', 'Do you have a life motto?', 'Har du ett livsmotto?', 47),
('wisdom', 'Was wünschst du dir für die Zukunft deiner Familie?', 'What do you wish for the future of your family?', 'Vad önskar du för din familjs framtid?', 48),
('wisdom', 'Wofür bist du am dankbarsten?', 'What are you most grateful for?', 'Vad är du mest tacksam för?', 49),
('wisdom', 'Wenn du eine Nachricht an die Welt hinterlassen könntest, was würdest du sagen?', 'If you could leave a message to the world, what would you say?', 'Om du kunde lämna ett meddelande till världen, vad skulle du säga?', 50),
('wisdom', 'Was war das beste Geschenk, das du jemals bekommen hast?', 'What was the best gift you ever received?', 'Vad var den bästa presenten du någonsin fått?', 51),
('wisdom', 'Erzähle eine letzte Geschichte, die du deiner Familie unbedingt erzählen möchtest.', 'Tell one last story that you absolutely want to share with your family.', 'Berätta en sista historia som du absolut vill dela med din familj.', 52);
