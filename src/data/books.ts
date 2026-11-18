import type { Book, ShelfStatus } from '../types/library';

export const GENRES = [
  'Fiction',
  'Romance',
  'Fantasy',
  'Horror',
  'Mystery',
  'Thriller',
  'Science Fiction',
  'Adventure',
  'Comedy',
  'Drama',
  'Educational',
  'Classics',
  'Manga & Woodblock',
  'Comics & Fables',
] as const;

export const SHELF_STATUSES: ShelfStatus[] = [
  'Currently Reading',
  'Want to Read',
  'Completed',
  'On Hold',
];

export const COLLECTIONS = [
  'Victorian Wit & Intrigue',
  'Midnight Gothic',
  'Voyages & Myth',
  'Enchanted Worlds',
] as const;

export const BOOKS: Book[] = [
  {
    id: 'pride',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    genres: ['Fiction', 'Romance', 'Classics', 'Drama', 'Comedy'],
    rating: 4.7,
    readers: 1480,
    hue: 38,
    spineColor: '#5c3d28',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_pride_prejudice_1795017772262.jpg`,
    plateCaption: 'Plate I — Pemberley Manor at Dusk',
    featured: true,
    editionLabel: 'Annotated Regency Edition',
    collection: 'Victorian Wit & Intrigue',
    description:
      'Elizabeth Bennet navigates society manners, family expectations, and sharp first impressions in Regency Hertfordshire when the aloof Mr. Darcy arrives at Netherfield Park.',
    chapters: [
      {
        title: 'Chapter I — Netherfield Park',
        subtitle: 'A Quiet Morning in Longbourn',
        text: `It is a truth universally acknowledged in Hertfordshire that news of a grand country estate changing hands travels faster than any post chaise. Before the autumn mist had lifted from the hedgerows of Longbourn, Mrs. Bennet had already arranged the future of her five daughters around the drawing room hearth.

Mr. Bennet listened from behind his leather-bound folio with dry amusement, stirring his tea while his wife enumerated the virtues of a gentleman with five thousand pounds a year. Elizabeth sat by the tall casement window, needlework resting in her lap, watching the garden gate swing in the cool October breeze.

By evening, half the parish knew that Mr. Bingley had arrived from London with his sisters and a taciturn friend from Derbyshire whose estate was rumored to be twice as grand. Candles flickered across mahogany tables as invitations were drafted on heavy cream stationery, each seal pressed in crimson wax.

Elizabeth smiled to herself as she folded her shawl for the evening walk. She had no patience for fortune-hunting, yet she felt an unmistakable curiosity about the strangers who would soon step onto the polished oak floor of the Meryton assembly room.`,
      },
      {
        title: 'Chapter II — The Meryton Assembly',
        subtitle: 'Candlelight & First Impressions',
        text: `Lanterns strung along the assembly balcony cast warm amber pools across the courtyard as carriages rolled over the cobblestones. Inside, violins tuned above the murmur of silk gowns, starched cravats, and eager introductions.

Mr. Bingley proved everything the neighborhood had hoped: lively, generous with his smiles, and immediately captivated by Jane Bennet's gentle grace. His companion, Mr. Darcy, drew every eye for the opposite reason. Tall and reserved beneath the crystal chandeliers, he stood apart near the marble mantel, conversing only with his party.

When Bingley urged him to join the next country dance, Darcy glanced briefly across the floor and declined in tones audible over a pause in the music. Elizabeth, seated beside Charlotte Lucas, caught every syllable. Rather than nursing wounded vanity, she turned the moment into an anecdote for her friends, her dark eyes bright with wry amusement.

On the carriage ride home beneath a silver crescent moon, Elizabeth resolved that wit would always outlast pride, little suspecting how many misunderstandings lay waiting between Longbourn and Pemberley.`,
      },
      {
        title: 'Chapter III — Letters & Pemberley',
        subtitle: 'Reflections in Derbyshire',
        text: `Spring rain gave way to late summer sun across the Derbyshire hills when Elizabeth traveled north with her aunt and uncle Gardiner. Approaching Pemberley through the ancient iron gates, she beheld a house of quiet dignity framed by sweeping lawns, clear trout streams, and wooded ridges.

In the picture gallery upstairs, afternoon light fell softly across portraits of the family. Stepping before a canvas of the master himself, Elizabeth lingered longer than she intended, recalling a weathered letter folded inside her traveling desk—pages written in resolute ink that had dismantled every prejudice she once held dear.

When footsteps sounded along the gravel terrace outside, neither Elizabeth nor Darcy spoke at once. Between the rose borders and the stone balustrade, the old stiffness had softened into quiet candor.

What had begun in sharp repartee beneath crowded chandeliers now settled into genuine esteem, proving that the truest judgments are rarely formed in a single evening.`,
      },
    ],
  },
  {
    id: 'alice',
    title: 'Alice’s Adventures in Wonderland',
    author: 'Lewis Carroll',
    year: 1865,
    genres: ['Fiction', 'Fantasy', 'Adventure', 'Classics', 'Comedy'],
    rating: 4.6,
    readers: 1320,
    hue: 265,
    spineColor: '#2d2449',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_alice_wonderland_1795017772292.jpg`,
    plateCaption: 'Plate I — The Watch Beneath the Root',
    featured: true,
    editionLabel: 'Illustrated Wonderland Edition',
    collection: 'Enchanted Worlds',
    description:
      'On a drowsy summer afternoon, Alice follows a waistcoated white rabbit down a mossy burrow into a labyrinth of riddles, talking tea-guests, and painted playing cards.',
    chapters: [
      {
        title: 'Chapter I — Down the Rabbit-Hole',
        subtitle: 'The Brass Pocket Watch',
        text: `Alice was growing thoroughly weary of sitting beside her sister on the clover bank with nothing whatever to occupy her mind. Twice she had leaned over to inspect the heavy volume resting on her sister's lap, finding neither pictures nor dialogue anywhere within its pages.

Just as the summer heat threatened to lull her asleep, a White Rabbit with pink eyes trotted briskly past the daisies. That alone might not have startled her, yet when the creature drew a gleaming brass pocket watch from its waistcoat and muttered anxiously about the hour, Alice sprang to her feet at once.

Across the sunlit meadow she chased him, diving headlong beneath the twisted roots of an ancient hedge. The tunnel ran level for a pace or two before plunging steeply downward like a dry stone well.

Down she drifted in slow, curious suspension, passing cupboards stacked with marmalade jars, framed maps, and brass lanterns until she landed softly upon a bed of dry autumn leaves at the center of a vaulted hall.`,
      },
      {
        title: 'Chapter II — A Mad Tea-Party',
        subtitle: 'Always Six O’Clock',
        text: `Beneath a spreading oak beside the March Hare's cottage stood a long trestle table laid with mismatched porcelain teacups, buttered toast, and silver sugar bowls. Though places were set for dozens, only the Hatter, the Hare, and a sleepy Dormouse occupied one corner.

"No room, no room!" they called out in chorus as Alice approached, despite the dozens of empty chairs stretching down the linen tablecloth. Unfazed, Alice seated herself firmly in an armchair at the head and demanded a proper explanation.

The Hatter tilted his tall felt hat and offered a riddle with no answer, while the March Hare poured lukewarm tea into the saucer. Every remark seemed to turn upon a pivot of nonsense, yet each speaker defended his logic with the gravity of a royal magistrate.

When the Dormouse murmured a tale of three sisters drawing treacle from a deep well, Alice rose quietly and stepped back into the twilight woods, determined to find a garden where time still moved forward.`,
      },
      {
        title: 'Chapter III — The Queen’s Croquet Ground',
        subtitle: 'Painted Roses & Playing Cards',
        text: `Through a small carved doorway hidden behind ivy, Alice stepped at last into a bright parterre where three gardeners wearing spades upon their backs were frantically painting white roses red with dripping brushes.

Before she could ask why, a trumpet sounded and a procession of diamond-trimmed courtiers marched across the lawn, led by the Queen of Hearts. Flamingos served as mallets and hedgehogs curled neatly into croquet balls while the Queen pronounced impossible sentences at every turn.

When called to testify before a jury of woodland creatures scribbling hastily on slate tablets, Alice realized she had grown back to her full height—and with it, her common sense had returned.

"Who cares for you?" she cried out as the deck of cards rose swirling into the golden air like autumn leaves, waking her gently back upon the riverbank with her sister brushing stray petals from her sleeve.`,
      },
    ],
  },
  {
    id: 'moby',
    title: 'Moby-Dick',
    author: 'Herman Melville',
    year: 1851,
    genres: ['Fiction', 'Adventure', 'Classics', 'Drama'],
    rating: 4.4,
    readers: 890,
    hue: 210,
    spineColor: '#1b2b3b',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_moby_dick_1795017772586.jpg`,
    plateCaption: 'Plate I — The White Whale Under Silver Moon',
    editionLabel: 'Nantucket Folio Edition',
    collection: 'Voyages & Myth',
    description:
      'Ishmael signs aboard the whaling ship Pequod out of Nantucket, only to discover Captain Ahab’s relentless hunt for an elusive white leviathan across the world’s deepest oceans.',
    chapters: [
      {
        title: 'Chapter I — Loomings',
        subtitle: 'Call Me Ishmael',
        text: `Call me Ishmael. Whenever a damp, drizzly November settles into my soul and the cobblestone alleys of Manhattan begin to feel too narrow for breathing, I know the time has come to turn my collar up and walk toward the harbor piers.

Every city street seems drawn toward the water as though iron filings pulled by an unseen lodestone. Sailors lean against weathered bollards watching brigantines clear the narrows, while gulls wheel low above the brackish swells.

To me, the sea is never merely commerce or mapwork; it is an open mirror of the restless human spirit. Taking a modest berth before the mast clears the fog from the mind far better than any apothecary draught.

With a single canvas sea-bag slung across my shoulder, I boarded the packet schooner bound for New Bedford and Nantucket, ready to meet whatever vessel fate had moored at the wharf.`,
      },
      {
        title: 'Chapter II — The Quarter-Deck',
        subtitle: 'The Gold Doubloon',
        text: `Weeks out from Nantucket, with the Atlantic trade winds humming steadily through the tarred rigging, Captain Ahab emerged at dawn upon the quarter-deck. His ivory leg clicked with measured cadence against the bleached pine planks as the crew gathered in silence.

From his coat pocket he drew a gleaming Spanish gold doubloon and nailed it with three ringing hammer blows to the mainmast. Every eye fixed upon the coin's stamped sun and mountain peaks catching the spray.

"Whoever raises a white-headed whale with a wrinkled brow and crooked jaw," Ahab declared in a voice like grinding anchor chains, "shall have this ounce of Peruvian gold!"

Starbuck, the sober first mate, stepped forward to counsel prudence, yet the wind carried Ahab's oath across the swells, binding ship and crew to a single towering obsession.`,
      },
      {
        title: 'Chapter III — The Chase',
        subtitle: 'Three Days on the Pacific',
        text: `On the Equator, where the Pacific rolls in long glassy mountains under an unbroken horizon, the lookout's cry echoed from the masthead at first light. A plume of white vapor hung against the cobalt sky, and every boat was lowered into the swell.

Three mornings running the ivory-flanked leviathan surfaced amid churning foam, shattering oak oars and outmaneuvering the harpooners with calm, ancient power. On the third afternoon, storm clouds bruised the western horizon while the Pequod's sails strained tight.

Standing at the bow of his cedar whaleboat, Ahab cast his final iron as lines hissed smoking through the chocks. The sea rose in a vast white vortex, drawing spars, canvas, and helmsman beneath the rolling blue plain.

Only a buoyant coffin-buoy carried Ishmael safely to the surface, leaving him alone on a quiet ocean to tell the story of the ship that sailed beyond reason.`,
      },
    ],
  },
  {
    id: 'tale',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    year: 1859,
    genres: ['Fiction', 'Drama', 'Classics'],
    rating: 4.5,
    readers: 940,
    hue: 12,
    spineColor: '#4c1f1a',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_two_cities_1795017772319.jpg`,
    plateCaption: 'Plate I — Between London Fog & Parisian Twilight',
    editionLabel: 'Historical Illustrated Edition',
    collection: 'Victorian Wit & Intrigue',
    description:
      'Set across London and revolutionary Paris, a story of quiet devotion, mistaken identity, and a selfless sacrifice that echoes across two turbulent capitals.',
    chapters: [
      {
        title: 'Chapter I — The Period',
        subtitle: 'November on Shooter’s Hill',
        text: `It was the best of times, it was the worst of times—an age of soaring reason and sudden shadow, when velvet carriages glided past hungry alleys and old crowns trembled above restless crowds.

On a Friday night late in November, the Dover mail coach labored up Shooter's Hill through mud thick enough to silence the iron rims. Steaming horses panted in the lantern glow while passengers trudged beside the wheels, wary of highwaymen lurking behind every gorse bush.

Out of the London mist came the rhythmic clatter of a lone courier's horse galloping up the ridge. Mr. Jarvis Lorry of Tellson's Bank leaned from the coach window to receive a terse slip of paper bearing three enigmatic words: Recalled to Life.

As the messenger wheeled back toward Temple Bar, Lorry sat motionless behind the curtained glass, knowing that the past he thought buried in Paris was about to open once more.`,
      },
      {
        title: 'Chapter II — Golden Thread',
        subtitle: 'Quiet Soho Gardens',
        text: `In a quiet corner near Soho Square, beneath a broad plane tree whose leaves rustled softly after summer showers, Doctor Alexandre Manette slowly mended the memory of eighteen lost years. Beside him, his daughter Lucie wove together a home filled with warmth, music, and unhurried grace.

Two very different men stepped often across that tranquil threshold: Charles Darnay, an exile who had renounced his French title out of conscience, and Sydney Carton, a brilliant barrister who veiled his weary heart in cynicism.

Carton walked the foggy London streets late into the night, pausing sometimes near the Soho gate just to watch the warm lamp glow behind Lucie's curtain. Though he asked nothing for himself, he made a quiet promise inside his own heart.

When distant thunder rolled across the English Channel, it would be Carton's unseen devotion that stood between that peaceful house and the storm.`,
      },
      {
        title: 'Chapter III — The Footsteps',
        subtitle: 'Dawn in Paris',
        text: `By autumn in Paris, cobblestone squares echoed with drums, tricolor banners, and the relentless rumble of tumbrils passing Saint Antoine. Darnay, returning out of loyalty to aid an old servant, found himself trapped behind stone prison walls.

Through the dim winter dusk stepped Sydney Carton, calm as he had never been in London. Trading coats and places inside the cell of the Conciergerie, he sent Darnay, Lucie, and Doctor Manette racing by coach toward the Dover coast.

Waiting at dawn beneath a clearing sky, Carton comforted a frightened seamstress with quiet steadiness, holding her hand as the city bells tolled the hour.

In that final stillness, he saw the peaceful home in Soho enduring through the years ahead—knowing at last that his life held a far, far better rest than any he had ever known.`,
      },
    ],
  },
  {
    id: 'scandal',
    title: 'A Scandal in Bohemia',
    author: 'Arthur Conan Doyle',
    year: 1891,
    genres: ['Mystery', 'Thriller', 'Fiction', 'Classics'],
    rating: 4.7,
    readers: 1150,
    hue: 42,
    spineColor: '#45321e',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_sherlock_scandal_1795017773214.jpg`,
    plateCaption: 'Plate I — 221B Baker Street by Lamplight',
    featured: true,
    editionLabel: 'Baker Street Mystery Edition',
    collection: 'Victorian Wit & Intrigue',
    description:
      'Sherlock Holmes and Dr. Watson accept a masked royal client’s urgent commission, matching wits with Irene Adler—the one adversary who truly outmaneuvers the great detective.',
    chapters: [
      {
        title: 'Chapter I — A Masked Visitor',
        subtitle: '221B Baker Street',
        text: `To Sherlock Holmes she is always the woman. Though I had heard him speak with brisk detachment of emperors and jewel thieves alike, Irene Adler remained in his memory as a mind worthy of his sharpest blade.

One crisp March evening, as London fog pressed damp silhouettes against the panes of Baker Street, I climbed the seventeen stairs to find Holmes pacing beside the coal fire. Before us lay a sheet of thick pink stationery scented faintly with violet and stamped with a strange Bohemian watermark.

Minutes later, heavy carriage wheels halted below and a towering figure muffled in an astrakhan-lined cloak entered the sitting room, concealing his features behind a black domino mask.

With a single glance at the visitor's boots and carriage crest, Holmes addressed him calmly by his true royal title—and agreed to recover a photograph whose exposure could shake a European throne.`,
      },
      {
        title: 'Chapter II — The Smoke Rocket',
        subtitle: 'Briony Lodge at Dusk',
        text: `At dawn Holmes vanished into the streets disguised as an out-of-work groom, lingering near the neat stucco walls of Briony Lodge in St. John's Wood. By afternoon he had witnessed a breathless wedding at St. Monica's Church and formed a plan worthy of the stage.

Asking me to stand beneath the parlor window at seven sharp with a simple plumber's smoke rocket tucked inside my coat, Holmes arrived dressed as a kindly elderly clergyman. A staged scuffle in the lane drew Miss Adler's sympathies, bringing the "injured" parson right into her sitting room.

At my signal of "Fire!" and a coil of harmless smoke curling across the rug, every instinct in the house rushed toward what it treasured most.

Holmes caught a fleeting glimpse of the sliding panel beside the bell-pull—certain that by morning the royal photograph would rest safely in his pocket.`,
      },
      {
        title: 'Chapter III — The Empty Alcove',
        subtitle: 'A Letter on the Velvet Table',
        text: `When we returned to Briony Lodge with the King in the pale morning light, the front door stood open and the parlor was hushed. Holmes crossed swiftly to the bell-pull and slid back the secret wooden shutter.

Resting inside the empty alcove were not only the coveted cabinet photograph, but a neatly sealed envelope addressed directly to Sherlock Holmes, Esq.

Inside, Irene Adler revealed that she had suspected the parson's disguise the moment the smoke cleared—and had followed us back to Baker Street dressed as a slim young man to bid him good night at his own doorway.

"Keep the photograph safe," she wrote, promising never to harm the King now that she had found a happier life. And for his fee, Holmes asked only for her portrait—still keeping it in honor above his mantelpiece.`,
      },
    ],
  },
  {
    id: 'frank',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    year: 1818,
    genres: ['Horror', 'Science Fiction', 'Sci-Fi', 'Classics', 'Fiction'],
    rating: 4.5,
    readers: 1090,
    hue: 165,
    spineColor: '#1d3832',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_frankenstein_1795017774241.jpg`,
    plateCaption: 'Plate I — Alpine Lightning Over the Watchtower',
    featured: true,
    editionLabel: '1818 Gothic Folio',
    collection: 'Midnight Gothic',
    description:
      'Driven by boundless ambition in a solitary laboratory, Victor Frankenstein awakens life from lifeless clay—only to confront the tragic consequences of abandoning his creation.',
    chapters: [
      {
        title: 'Chapter I — The Arctic Rescue',
        subtitle: 'Letters from the Northern Ice',
        text: `You will rejoice to hear that no disaster has darkened our northern voyage, though the ship now lies wedged amid vast blue ridges of drifting pack ice. Yesterday afternoon, as fog lifted across the frozen plain, my crew spotted a strange sleigh drawn by dogs racing rapidly toward the horizon.

The next morning brought an astonishing rescue: a gaunt, fever-worn traveler clinging to a broken floe, his eyes burning with sorrow and urgent purpose. Once warmed beside the cabin stove, he refused to rest until he had heard where our expedition was bound.

Hearing of my thirst for discovery, Victor Frankenstein grasped my hand and began his confession as sleet tapped steadily against the porthole glass.

"Learn from me," he whispered as I opened my journal to record every word, "how dangerous is the acquirement of knowledge without compassion."`,
      },
      {
        title: 'Chapter II — A Dreary Night in November',
        subtitle: 'The Spark of Being',
        text: `It was on a dreary night of November that I beheld the accomplishment of my toils in Ingolstadt. Rain beat wildly against the leaded attic window while my single tallow candle burned low beside coils of copper wire and glass jars.

Through months of sleepless obsession, I had forgotten the warmth of Geneva's lakeside mornings and the quiet letters from Elizabeth and Clerval. All my world had narrowed to the motionless figure stretched upon the slate table.

When the storm broke overhead and the spark passed into that quiet frame, the dull yellow eye opened slowly and a convulsive breath stirred the air.

Horrified by what I had called into being without pausing to consider its soul, I fled into the rain-slick courtyard—leaving my creation alone in the dark to discover a hostile world.`,
      },
      {
        title: 'Chapter III — Above the Mer de Glace',
        subtitle: 'Meeting on the Glacier',
        text: `High above Chamonix, where jagged granite needles pierce the clouds and rivers of blue ice groan beneath shifting snow, I climbed alone hoping the mountain silence might quiet my grief.

Suddenly a figure bounded across the crevasses with superhuman swiftness and stood before me beside a pine-wood hut. Yet the voice that spoke was neither savage nor blind; it carried the cadence of Milton, Plutarch, and wounded longing.

Over a crackling hearth inside the shelter, the creature told of his winter spent hidden behind a peasant cottage—learning speech, music, and kindness from afar, only to meet fear wherever he stepped into daylight.

"I am malicious because I am miserable," he pleaded as wind howled across the glacier. "Make me a companion, or watch what isolation does to a living mind."`,
      },
    ],
  },
  {
    id: 'dracula',
    title: 'Dracula',
    author: 'Bram Stoker',
    year: 1897,
    genres: ['Horror', 'Thriller', 'Classics', 'Fiction'],
    rating: 4.5,
    readers: 1180,
    hue: 352,
    spineColor: '#48131a',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_dracula_1795017774753.jpg`,
    plateCaption: 'Plate I — The Road to Castle Dracula',
    editionLabel: 'Archival Epistolary Edition',
    collection: 'Midnight Gothic',
    description:
      'Jonathan Harker journeys into the Carpathian mountains to settle an English estate deed, uncovering an ancient Count whose shadow reaches across the sea to London.',
    chapters: [
      {
        title: 'Chapter I — Jonathan Harker’s Journal',
        subtitle: '3 May · Bistritz & the Borgo Pass',
        text: `3 May. Bistritz.—Left Munich on the first of May and arrived in the Carpathians just as twilight steeped the pine valleys in indigo shadow. At the Golden Crown Inn, the landlord's wife pressed a small silver crucifix into my palm before I boarded the coach for the Borgo Pass.

As our horses climbed higher along the winding mountain road, peasant passengers whispered anxiously and crossed themselves whenever a lone wolf howled from the gorge below. Mist curled through the fir trees like pale smoke.

At the crest of the pass, a black calèche drawn by four coal-black steeds awaited me beside a granite shrine. The driver's eyes gleamed crimson in the carriage lamps as he lifted my heavy portmanteau effortlessly with one hand.

Upward we raced through howling wind until jagged stone battlements loomed sheer against a vast red moon: Castle Dracula.`,
      },
      {
        title: 'Chapter II — The Library at Midnight',
        subtitle: '7 May · Mirrors & Locked Doors',
        text: `I slept late into the afternoon and woke to find a solitary silver service laid beside the hearth. Though the Count speaks polished English and fills his high-vaulted library with London atlases, legal deeds, and railway timetables, I have yet to see him dine—or cast a single reflection.

This morning, while shaving before my small travel glass, I felt a cold hand touch my shoulder. Turning, I saw Count Dracula standing squarely behind me; yet in the mirror behind my face there appeared only empty tapestry and candlelight.

Outside my tall arched window, stone cliffs plunge hundreds of feet into black forest valleys. Every oak door along the lower corridor stands bolted from without.

Tonight I begin exploring the ruined chapel stairs by taper light—for I fear I am no guest here, but a prisoner.`,
      },
      {
        title: 'Chapter III — The Demeter at Whitby',
        subtitle: '8 August · Mina Murray’s Notebook',
        text: `Along the windswept cliffs of Whitby Abbey, gulls shrieked above whitecaps as an unnatural summer gale drove a derelict Russian schooner straight onto the sandbank below the East Cliff steps.

No living sailor stepped ashore; only a grim logbook lashed to the helm told of crewmen vanishing one by one beneath midnight fogs, and of fifty wooden boxes filled with Transylvanian earth stowed deep inside the hold.

Armed with shorthand journals, phonograph cylinders, and Professor Van Helsing's fierce resolve, our small circle gathered in London to trace each crate through darkened chapels and forgotten alleys.

Before the autumn frost arrived, we would pursue the Count back across Europe to the Borgo Pass—racing the setting sun to end a centuries-old darkness.`,
      },
    ],
  },
  {
    id: 'jane',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    year: 1847,
    genres: ['Romance', 'Drama', 'Classics', 'Fiction'],
    rating: 4.6,
    readers: 960,
    hue: 280,
    spineColor: '#372140',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_jane_eyre_1795017774655.jpg`,
    plateCaption: 'Plate I — Thornfield Hall Across the Moors',
    editionLabel: 'Yorkshire Moors Edition',
    collection: 'Midnight Gothic',
    description:
      'An independent-minded governess arrives at brooding Thornfield Hall, discovering fierce affection, buried secrets behind locked attic doors, and the strength of her own conscience.',
    chapters: [
      {
        title: 'Chapter I — Gateshead & Lowood',
        subtitle: 'Behind the Scarlet Curtain',
        text: `There was no possibility of taking a walk that afternoon; winter rain swept slantwise across the leafless shrubbery at Gateshead Hall. Slipping quietly behind the heavy red moreen curtain of the breakfast-room window seat, I drew Bewick's History of British Birds onto my knees.

Protected between glass panes and crimson drapery, I journeyed in imagination to bleak Norwegian headlands and icebergs drifting beneath pale polar skies—anywhere beyond the cold taunts of my cousins.

Years later at Lowood School, amidst frostbitten mornings and strict lessons, Helen Burns taught me that dignity lives within one's own spirit rather than the favor of tyrants.

When at eighteen I packed my modest wooden trunk for Millcote, I carried no fortune—only a stubborn heart determined to see a wider world.`,
      },
      {
        title: 'Chapter II — Thornfield Hall',
        subtitle: 'Footsteps on the Third Story',
        text: `By candlelight Thornfield Hall smelled of cedarwood, beeswax, and heather blown in from the surrounding moors. Mrs. Fairfax welcomed me kindly to a bright chamber overlooking the orchard, and little Adèle chattered eagerly beside the nursery fire.

My employer, Mr. Edward Rochester, returned one frosty evening after my lantern startled his horse along Hay Lane. Brusque, restless, and sharp-witted, he demanded honesty rather than flattery, finding in our evening fireside talks a companion equal to his own fierce mind.

Yet Thornfield kept uneasy shadows. Late at night, strange muffled laughter drifted down the dim gallery of the third story, and once a mysterious fire broke out beside Mr. Rochester's bed curtains.

Even as spring hawthorns bloomed across the orchard, I felt a quiet foreboding beneath the battlements.`,
      },
      {
        title: 'Chapter III — Ferndean',
        subtitle: 'Reader, I Married Him',
        text: `After fleeing Thornfield with nothing but my conscience intact, I found kinship among the Rivers sisters at Moor House—and a surprising inheritance that granted me independence at last. Still, across miles of purple heather, one voice seemed to call through the still summer night.

Returning to Millcote, I found only blackened stone walls where Thornfield had stood, and followed the path deep into the quiet woods of Ferndean Manor.

There, sitting beside the shaded porch with his faithful hound Pilot at his feet, was Mr. Rochester—scarred and humbled by fire, yet unchanged in heart.

Reader, I married him. A quiet wedding it was, beneath green forest boughs where pride and secrecy had burned away, leaving only clear, enduring light.`,
      },
    ],
  },
  {
    id: 'war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    year: -500,
    genres: ['Educational', 'Classics'],
    rating: 4.4,
    readers: 820,
    hue: 45,
    spineColor: '#5c4b28',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_art_war_1795017775588.jpg`,
    plateCaption: 'Plate I — Ink Mountains & Bamboo Scrolls',
    editionLabel: 'Bilingual Classical Monograph',
    collection: 'Voyages & Myth',
    description:
      'The timeless ancient treatise on strategy, foresight, terrain, and winning decisive victories without needless conflict.',
    chapters: [
      {
        title: 'Chapter I — Laying Plans',
        subtitle: 'The Five Constant Factors',
        text: `Sun Tzu said: The art of strategy is of vital importance to every commonwealth. It governs survival and ruin alike, and therefore deserves calm, patient study before a single banner is raised.

Before setting out, weigh five constant factors: Moral Purpose, which unites people and leadership in shared trust; Heaven, meaning season, weather, and shifting light; Earth, meaning distance, ridges, narrow passes, and open plains; Command, marked by wisdom, sincerity, courage, and discipline; and Method, the quiet order of supply and readiness.

All conduct rests upon perception. When able, appear unhurried; when near, seem distant; when far, seem close at hand. Strike where preparation is absent, and move where surprise finds an open gate.

The commander who calculates carefully within the council hall prevails before a single drum has sounded.`,
      },
      {
        title: 'Chapter II — Waging War',
        subtitle: 'Swiftness & Economy',
        text: `In every campaign, prolonged struggle dulls the sharpest blade and exhausts the quiet countryside. Even the most skilled general cannot point to a war dragged out for years that brought lasting prosperity to its people.

Therefore, value swiftness above spectacle, and clarity above stubborn pride. When provisions must be carried across barren passes, every wasted day weighs twice as heavily upon those at home.

Treat captured resources with care and respect former adversaries, using what is gained to strengthen rather than scatter your own ranks.

True mastery seeks swift resolution—preserving both households and harvests intact.`,
      },
      {
        title: 'Chapter III — Attack by Stratagem',
        subtitle: 'Winning Without Battle',
        text: `To win one hundred victories in one hundred battles is not the summit of skill. To subdue opposition without fighting at all—that is supreme artistry.

Thus the finest policy unravels opposing plans before they harden; the next best separates alliances; only as a last resort does one meet forces in the open field, and never throw troops blindly against high stone walls.

Know your own strengths and understand those across from you, and in a hundred encounters you will stand unshaken. Know yourself yet remain blind to others, and victory becomes half chance.

Like water shaping itself to the contour of the valley, the wise strategist adapts without ego and prevails without noise.`,
      },
    ],
  },
  {
    id: 'odyssey',
    title: 'The Odyssey',
    author: 'Homer',
    year: -800,
    genres: ['Adventure', 'Fantasy', 'Classics', 'Drama'],
    rating: 4.8,
    readers: 1260,
    hue: 28,
    spineColor: '#5b341b',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_odyssey_1795017775843.jpg`,
    plateCaption: 'Plate I — The Terracotta Sail Upon the Aegean',
    featured: true,
    editionLabel: 'Mediterranean Illustrated Edition',
    collection: 'Voyages & Myth',
    description:
      'Odysseus braves cyclopes, sirens, storms, and ten wandering years across the wine-dark sea to reclaim his island home of Ithaca.',
    chapters: [
      {
        title: 'Book I — The Wine-Dark Sea',
        subtitle: 'Council on Olympus',
        text: `Tell me, Muse, of the man of many turns, driven far off course after the high walls of Troy fell into ash. Many cities he saw and many minds he studied, enduring hardship upon the open sea as he fought to bring his companions home.

Yet while the other Greek captains had long since anchored in quiet bays, Odysseus remained stranded upon Calypso's cedar-scented island, gazing daily across the white surf toward distant Ithaca.

In Ithaca itself, rowdy suitors feasted nightly inside his stone hall, wasting herds and orchards while loyal Penelope wove by day and unwove her tapestry by torchlight.

High on Olympus, gray-eyed Athena spoke at last for the wanderer's return—sending Hermes skimming across the waves on golden sandals to unbar the sea.`,
      },
      {
        title: 'Book IX — The Cyclops’ Cave',
        subtitle: 'Nobody & the Ram',
        text: `Driven through thick sea-fog onto a rugged limestone shore, Odysseus and twelve chosen oarsmen climbed toward a cavern overhanging with laurel boughs. Inside waited woven baskets of cheese and pens crowded with heavy-fleeced sheep.

At dusk returned Polyphemus, a towering one-eyed giant bearing half a mountain pine for firewood, who rolled a boulder across the cave mouth that twenty teams of oxen could scarcely stir.

Refusing to panic, Odysseus offered sweet dark Ismarian wine until slumber claimed the giant, naming himself only as "Nobody" when questioned by torchlight.

At dawn, lashed securely beneath the bellies of the giant's thickest rams, Odysseus and his surviving crew slipped unseen past the blind giant's outstretched hands back to their black ship.`,
      },
      {
        title: 'Book XII — Song of the Sirens',
        subtitle: 'Wax & Hempen Rope',
        text: `Before reaching the sunlit strait, Circe warned Odysseus of the flowery meadow where the Sirens sang—voices so clear and knowing that no mariner who lingered ever saw hearth-smoke rise from home again.

As the wind dropped into glassy stillness, Odysseus kneaded golden beeswax in his palms and sealed the ears of every rower along the benches. For himself, he ordered his crew to lash him upright against the pine mast with doubled hempen rope.

When the hull glided past the silver cliffs, the Sirens' melody drifted over the water, promising wisdom of all things beneath the earth.

Though Odysseus strained against the knots and signaled frantically with his brows, his faithful oarsmen only bent harder to the ash blades until the enchanted shore faded into mist behind them.`,
      },
    ],
  },
  {
    id: 'timemachine',
    title: 'The Time Machine',
    author: 'H.G. Wells',
    year: 1895,
    genres: ['Science Fiction', 'Sci-Fi', 'Adventure', 'Classics'],
    rating: 4.5,
    readers: 1030,
    hue: 198,
    spineColor: '#1f3644',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_time_machine_1795017776429.jpg`,
    plateCaption: 'Plate I — The Brass Chronometer in the Observatory',
    editionLabel: 'Victorian Scientific Romance',
    collection: 'Voyages & Myth',
    description:
      'A Victorian inventor constructs a brass-and-quartz machine capable of sailing forward through centuries, discovering a sunlit yet hauntingly divided world of the distant future.',
    chapters: [
      {
        title: 'Chapter I — The Fourth Dimension',
        subtitle: 'After Dinner in Richmond',
        text: `The Time Traveller—for so it is easiest to call him—was expounding a startling proposition to our Thursday circle beside his blazing Richmond fireplace. Brass lamps gleamed on oak paneling while we leaned forward in our leather chairs, skeptical yet fascinated.

"Any real body," he insisted, holding up a miniature brass-and-ivory contraption upon his palm, "must have length, breadth, thickness, and duration. Why should we move freely along three dimensions and remain chained to a single direction in the fourth?"

The Psychologist touched the tiny ivory lever. With a faint shimmer of displaced air, the model spun into translucence and vanished completely from the baize table.

A week later, when we assembled again for dinner, the door opened to reveal our host dusty, limping, and pale—asking only for a glass of water before recounting his journey to the year 802,701.`,
      },
      {
        title: 'Chapter II — The Golden Age of the Eloi',
        subtitle: 'Year 802,701',
        text: `Pulling the starting lever in his workshop, he had watched dusk and dawn blur into a continuous flickering ribbon. The sun arched across the sky in seconds; brick towers rose like mushrooms and crumbled into moss beneath racing clouds.

Halting amid sudden hailstones beside a ruined marble sphinx, he stepped into a lush garden valley where delicate, blossom-crowned beings known as the Eloi laughed along ruined colonnades and shared bowls of strange purple fruit.

Yet paradise wore subtle cracks. Looking down the mossy ventilation shafts scattered across the lawns, he heard the steady rhythmic throb of hidden engines turning beneath the earth.

That evening, when his brass machine vanished behind the bronze pedestal of the White Sphinx, he realized the carefree sunlit garden had an unseen underworld: the Morlocks.`,
      },
      {
        title: 'Chapter III — Further Vision',
        subtitle: 'The Red Sun at World’s End',
        text: `Escaping the subterranean tunnels with sparks of camphor flame, the Traveller recovered his machine from the sphinx pedestal and hurled the lever forward once more across millions of silent years.

Slowing at last upon a silent beach of dark green moss, he looked upon a colossal crimson sun resting motionless near the horizon. No human voice stirred the thin icy air; only giant crab-like creatures crawled slowly across wet slate stones beneath a faint eclipse.

A deep chill settled over the quiet sea, and he hastened back across the river of centuries to his own warm study in Richmond, bearing two strange white blossoms Weena had slipped inside his pocket.

The next morning he stepped back into his laboratory with a knapsack and camera—and set out into the ages once more, never yet returning.`,
      },
    ],
  },
  {
    id: 'dorian',
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    year: 1890,
    genres: ['Drama', 'Horror', 'Mystery', 'Classics'],
    rating: 4.6,
    readers: 1120,
    hue: 336,
    spineColor: '#3f1c2b',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_dorian_gray_1795017777480.jpg`,
    plateCaption: 'Plate I — Still Life Before the Gilded Frame',
    editionLabel: 'Fin-de-Siècle Collector’s Edition',
    collection: 'Victorian Wit & Intrigue',
    description:
      'A young Londoner’s wish that his painted portrait bear the marks of time and conscience instead of his own face unravels into velvet obsession and haunting regret.',
    chapters: [
      {
        title: 'Chapter I — The Studio',
        subtitle: 'Scent of Lilac & Oil Paint',
        text: `Basil Hallward's studio was rich with the heavy scent of summer roses blowing through open French doors, mingled with turpentine and warm beeswax. Upon a divan of Persian saddle-bags lounged Lord Henry Wotton, blowing slender rings of smoke while admiring the full-length portrait resting on the easel.

"It is your finest work, Basil," Lord Henry murmured lazily. "You must send it to the Grosvenor this season."

Yet Hallward shook his head, insisting he had poured far too much of his own admiration and soul into the canvas ever to hang it before a curious London crowd.

Moments later Dorian Gray himself stepped across the threshold—unspoiled, golden-haired, and unaware how swiftly a single afternoon's wit would alter the course of his life.`,
      },
      {
        title: 'Chapter II — The Wish',
        subtitle: 'A Shadow Upon the Canvas',
        text: `Standing before the finished painting as afternoon light slanted gold across the floorboards, Dorian listened while Lord Henry praised youth as the only jewel worth keeping—warning that seasons would steal every bright line all too soon.

A sudden ache seized Dorian's heart. Looking from the luminous canvas back to his own reflection, he whispered a reckless bargain into the still studio air: that the painting might grow wrinkled and old while he remained untouched forever.

Weeks later, after his cruel dismissal of the young actress Sibyl Vane, Dorian paused beneath his candlelit landing and noticed a subtle line of bitterness curving the painted mouth.

Frightened yet fascinated, he dragged a velvet screen across the easel—and hid the living mirror behind locked doors in his childhood schoolroom upstairs.`,
      },
      {
        title: 'Chapter III — The Attic Room',
        subtitle: 'Midnight Above Grosvenor Square',
        text: `Eighteen years glided past in gilded salons, opera boxes, and perfumed drawing rooms. While friends grew silver-haired and careworn, Dorian Gray remained effortlessly luminous, though whispers followed him through foggy Mayfair alleys.

In the locked attic above, however, the canvas had grown monstrous—burdened by every cruel impulse, hidden lie, and broken promise its master refused to carry upon his brow.

One still winter night, determined to erase the past in one stroke, Dorian climbed the dusty stairs carrying the same knife that had sealed his guilt and slashed squarely through the painted chest.

A terrible cry rang across Grosvenor Square. When servants broke open the attic door, they found the portrait shining in flawless youthful beauty—while on the oak floor lay an aged stranger with Dorian's rings upon his fingers.`,
      },
    ],
  },
  {
    id: 'wizard',
    title: 'The Wonderful Wizard of Oz',
    author: 'L. Frank Baum',
    year: 1900,
    genres: ['Fantasy', 'Adventure', 'Comedy', 'Classics'],
    rating: 4.7,
    readers: 1190,
    hue: 145,
    spineColor: '#1b4730',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_wizard_oz_1795017777767.jpg`,
    plateCaption: 'Plate I — The Road Toward the Emerald Spires',
    editionLabel: 'Emerald City Color Edition',
    collection: 'Enchanted Worlds',
    description:
      'Carried away from the Kansas prairies by a cyclone, Dorothy Gale travels the yellow brick road with a Scarecrow, Tin Woodman, and Lion to seek the Wizard of Oz.',
    chapters: [
      {
        title: 'Chapter I — The Cyclone',
        subtitle: 'From Gray Prairies to Vivid Green',
        text: `Dorothy lived in the midst of the great Kansas prairies with Uncle Henry, Aunt Em, and her little black dog Toto. Everything around the timber farmhouse—from the sun-baked clapboards to the endless horizon of dry grass—had turned softly gray under prairie wind and sun.

Then came an afternoon when the north wind began to wail like an iron flute and the sky darkened to bruised copper. Before Dorothy could reach the storm cellar door with Toto tucked safely in her arms, the cyclone spun the little wooden house straight upward into the clouds.

Hours passed like a quiet dream inside the eye of the storm until, with a gentle thump, the floorboards settled onto soft moss.

Opening the door, Dorothy gasped at sunlit orchards, crystalline brooks, and bright-plumaged birds singing across a country more vivid than any painted storybook.`,
      },
      {
        title: 'Chapter II — Companions of the Road',
        subtitle: 'Straw, Tin & Courage',
        text: `Slipping on a pair of enchanted silver shoes and stepping onto the winding road of yellow brick, Dorothy had not walked far before a stuffed Scarecrow perched upon a cornfield pole blinked politely and asked to come along in hopes of finding brains.

Beyond a whispering forest clearing they discovered a motionless Tin Woodman holding his gleaming axe beside an oil can—eager to ask the Great Wizard for a beating heart.

Soon after, a mighty Lion sprang across the mossy path, only to confess softly that beneath his thunderous roar he longed most of all for quiet courage.

Arm in arm through scarlet poppy fields and crystal rivers, the four travelers marched onward until green-tinted clouds glowed above the jeweled towers of the Emerald City.`,
      },
      {
        title: 'Chapter III — Behind the Screen',
        subtitle: 'The Silver Shoes',
        text: `Inside the vast green marble Throne Room, after braving winged monkeys and the Wicked Witch of the West, Toto accidentally tipped over an ornate corner screen—revealing not an omnipotent sorcerer, but a kindly old balloonist from Omaha working levers and bellows.

Yet the Wizard proved wiser than his illusions. To the Scarecrow he gave crisp bran and pins of wit; to the Tin Woodman a silk heart stuffed with sawdust; and to the Lion a draft of quiet confidence.

Every companion discovered that the wisdom, kindness, and bravery they sought had already guided them along every mile of the road.

Clicking the heels of her silver shoes together three times under Glinda's blessing, Dorothy spun swiftly back to Aunt Em's warm embrace upon the prairie grass.`,
      },
    ],
  },
  {
    id: 'hokusai',
    title: 'Folktales & Woodblock Sketches',
    author: 'Lafcadio Hearn & Hokusai',
    year: 1894,
    genres: ['Manga & Woodblock', 'Comics & Fables', 'Fantasy', 'Horror'],
    rating: 4.8,
    readers: 970,
    hue: 192,
    spineColor: '#1d3642',
    coverUrl: `${import.meta.env.BASE_URL}src/assets/images/cover_hokusai_folktales_1795017778028.jpg`,
    plateCaption: 'Plate I — Lantern Bamboo Path & Silver Cranes',
    editionLabel: 'Ukiyo-e Illustrated Scroll Edition',
    collection: 'Enchanted Worlds',
    description:
      'A curated collection of Japanese moonlight folktales, phantom bamboo groves, and classic ukiyo-e woodblock parables celebrating visual storytelling and folk wonder.',
    chapters: [
      {
        title: 'Scroll I — The Boy Who Drew Cats',
        subtitle: 'Ink Upon Paper Screens',
        text: `In a quiet mountain village long ago lived a gentle boy too small for heavy farm work, yet gifted with an unstoppable love for sketching cats in the margins of every temple ledger, wooden pillar, and rice-paper screen.

Though the old priest warned him gently to avoid large spaces at night and keep to small ones, the boy wandered one twilight to a deserted monastery deep in the cedar hills, carrying only his worn brush and inkstone.

By candlelight he painted magnificent curling-tailed cats across the wide white sliding doors before climbing inside a small lacquered cabinet to sleep.

At midnight, thunder shook the rafters as a monstrous goblin rat descended—only to be vanquished before dawn by the ink-drawn guardians who had stepped straight from the paper screens.`,
      },
      {
        title: 'Scroll II — The Crane’s Gratitude',
        subtitle: 'Winter Loom & Snowflakes',
        text: `During a bitter northern winter, an impoverished woodcutter freed a wounded red-crowned crane tangled in frost-stiffened reeds beside the frozen marsh.

That evening, as snow drifted silently against the shoji lattice, a serene young woman knocked upon his door seeking shelter from the storm. Soon she became his devoted wife, asking only that he never peek inside the weaving room while she worked at the wooden loom.

Night after night, the shuttle sang softly until bolts of luminous silk shimmered like moonlight spun from frost.

When curiosity at last parted the sliding screen, the woodcutter beheld a lone crane weaving her own snowy feathers into cloth—before she spread wide wings beneath the crescent moon and vanished over the pines.`,
      },
      {
        title: 'Scroll III — The Lantern Waterfall',
        subtitle: 'Notes on Hokusai’s Brush',
        text: `Master Katsushika Hokusai called himself simply the Old Man Mad About Painting, sketching rushing waterfalls, startled cranes, bamboo shadows, and travelers along misty mountain passes with swift, living ink lines that laid the groundwork for modern sequential art and manga.

Notice how a single curved brushstroke conveys the weight of wind in cedar boughs, or how empty cream paper becomes drifting mountain fog around a waterfall's plunge.

In these woodblock stories, image and prose answer one another like voice and echo—proving that a picture need never merely decorate a page, but carries half the tale itself.

Turn the leaf gently, and let the lantern path guide your eye into the mist.`,
      },
    ],
  },
];

export const getBookById = (id?: string): Book | undefined =>
  BOOKS.find((b) => b.id === id);

export const getSimilarBooks = (book: Book, count = 5): Book[] =>
  BOOKS.filter((b) => b.id !== book.id)
    .map((candidate) => ({
      book: candidate,
      score: candidate.genres.filter((g) => book.genres.includes(g)).length,
    }))
    .sort((a, b) => b.score - a.score || b.book.rating - a.book.rating)
    .slice(0, count)
    .map((item) => item.book);
