/**
 * CARTA — Super Bowling Medellín
 * ───────────────────────────────
 * Contenido transcrito de la carta oficial en PDF (copia local en
 * public/assets/carta-super-bowling.pdf). Fuente única de verdad del menú:
 * editar aquí actualiza la página /carta. Precios en COP.
 *
 * Identidad: cocina a la LEÑA — parrilla, ahumados y cortes — más sushi de
 * autor, pizzas artesanales y una coctelería amplia. El orden de categorías
 * lidera con la parrilla; lo asiático (sushi, okonomiyaki) es una parte, no el
 * centro. Sin emojis: jerarquía limpia en estética negro/oro.
 *
 * Nota: algunos nombres conservan la grafía original de la carta (p. ej.
 * "Tribv", "Cheese Burguer").
 */

export type MenuItem = {
  name: string;
  desc?: string;
  /** Precio mostrado tal cual (admite variantes "x / y" o "Botella/Trago"). */
  price?: string;
  /** Etiquetas de perfil (p. ej. cócteles: "Dulce", "Refrescante"). */
  tags?: string[];
};

export type MenuGroup = {
  /** Subtítulo del grupo dentro de la categoría (opcional). */
  name?: string;
  note?: string;
  items: MenuItem[];
};

export type MenuCategory = {
  id: string;
  name: string;
  note?: string;
  /** Imagen de banner opcional (ruta en /public). */
  image?: string;
  groups: MenuGroup[];
};

export const menu: MenuCategory[] = [
  // ── 1. PARRILLA & CORTES (identidad de la casa) ──
  {
    id: "parrilla",
    name: "Parrilla & Cortes",
    image: "/Comida.jpg",
    note: "Cocina a la leña. Rituales de la casa: Fuego, Niebla y Ahumado.",
    groups: [
      {
        name: "Cortes Importados",
        items: [
          {
            name: "New York Importado",
            price: "$198.000",
            desc: "350gr. El New York Strip, corte importado famoso por su jugosidad y suavidad, con notas ahumadas y una costra dorada, acompañado de papas criollas al romero y limón.",
          },
          {
            name: "Picaña Importada",
            price: "$136.000",
            desc: "350gr. Un corte seleccionado de res, apreciado por su jugosidad y marmoleo, acompañado de papas criollas al romero y limón.",
          },
        ],
      },
      {
        name: "Platos a la Parrilla",
        items: [
          {
            name: "Pollo Ahumado a la Cerveza",
            price: "$86.000",
            desc: "Medio pollo de campo marinado con especias seleccionadas y cerveza artesanal durante 72 horas, ahumado por 8 horas en leña natural, acompañado de salsa de cilantro, limones parrillados y papa casco.",
          },
          {
            name: "Hamburguesa Piel Roja",
            price: "$85.000",
            desc: "Pan pretzel, doble carne (300gr) a término en leña, tocineta ahumada, pepinillos agridulces, vegetales frescos, salsa de chiles dulces, chimichurri y queso mozzarella, acompañada de papas casco.",
          },
          {
            name: "Solomito a la Parrilla",
            price: "$84.000",
            desc: "250gr. Solomito seleccionado hecho a la leña, acompañado de papas casco, chimichurri y salsa de tomate.",
          },
          {
            name: "Parrillada Mixta",
            price: "$143.000",
            desc: "Picaña importada, pechuga de pollo en finas hierbas, langostinos en chimichurri, vegetales salteados en vino blanco y papas criollas.",
          },
        ],
      },
    ],
  },

  // ── 2. ENTRADAS & PARA COMPARTIR ──
  {
    id: "entradas",
    name: "Entradas & Para Compartir",
    groups: [
      {
        name: "Entradas Mar",
        items: [
          {
            name: "Bocaditos Salvajes",
            price: "$67.000",
            desc: "Láminas de salmón fresco rellenas de aguacate y queso crema con tope de salsa octopus (pulpo, palmito de cangrejo y chiles dulces), yacón caramelizado y salsa teriyaki.",
          },
          {
            name: "Avocado Crunch",
            price: "$51.000",
            desc: "3 rodajas de aguacate apanadas con tope de ceviche cremoso de camarón y remolacha caramelizada con salsa teriyaki.",
          },
          {
            name: "Ceviche Tribv",
            price: "$69.000",
            desc: "Ceviche de pescado blanco en salsa cremosa con papa criolla, aguacate y maíz tostado con un toque de aceite de ajonjolí, acompañado de chips de plátano y yuca crocante.",
          },
          {
            name: "Ceviche Tropical",
            price: "$73.000",
            desc: "Ceviche de pescado en salsa blanca, con toque de frutas tropicales, aguacate y langostinos tempurizados crocantes.",
          },
        ],
      },
      {
        name: "Entradas Tierra",
        items: [
          {
            name: "Molcajete de Chicharrón",
            price: "$46.000",
            desc: "Chicharrón crocante sobre cama de guacamole rústico con medias lunas de arepa fritas, totopos, gajos de limón y pico de gallo de mango maduro.",
          },
        ],
      },
      {
        name: "Para Compartir",
        items: [
          {
            name: "Mixto de Tacos",
            price: "$116.000",
            desc: "9 tacos surtidos: pollo ahumado en salsa agridulce; pulled pork y piña asada en BBQ de chamoy; carne desmechada en salsa criolla. Con salsa verde, picadillo, guacamole, caldo de frijol y gajos de limón.",
          },
          {
            name: "Ceviche de Chicharrón",
            price: "$58.000",
            desc: "Chicharrón ahumado con infusión de ingredientes frescos y cítricos, acompañado de chips de plátano y yuca.",
          },
          {
            name: "Chinchulines al Limón Parrillado",
            price: "$39.000",
            desc: "200gr de chinchulines tostados al estilo tribv, sobre cama de papas criollas al limón y romero, con limón parrillado, medias lunas de arepa frita y chimichurri.",
          },
        ],
      },
    ],
  },

  // ── 3. FUERTES (pastas, salmón, costillas, hamburguesas, ensaladas) ──
  {
    id: "fuertes",
    name: "Fuertes",
    image: "/Comidas-3.jpg",
    groups: [
      {
        items: [
          {
            name: "Solomito al Tequila",
            price: "$200.000",
            desc: "500gr. Solomito madurado 72 horas y ahumado con madera de roble, finalizado en mantequilla especiada y flambeado con tequila en mesa, con pan baguette, papa casco y ensalada.",
          },
          {
            name: "Nido Salvaje de Solomito Stroganoff",
            price: "$67.000",
            desc: "Base de masa madre reposada 72 horas, rellena de solomito en salsa stroganoff, cubierta con queso doble crema gratinado.",
          },
          {
            name: "Salmón al estilo Cajún",
            price: "$94.000",
            desc: "Salmón envuelto en especias seleccionadas, mantequilla y romero a la parrilla, con vegetales al vapor y al vino tinto.",
          },
          {
            name: "Fettuccine y Solomito",
            price: "$86.000",
            desc: "Fettuccine al dente, solomito a la parrilla, portobello, tomates confitados, parmesano y queso grana padano en salsa blanca.",
          },
          {
            name: "Fettuccine y Pollo en Finas Hierbas",
            price: "$70.000",
            desc: "Fettuccine al dente, pollo en finas hierbas a la parrilla, tocineta ahumada, champiñones en salsa de pimentones y tomatillos tatemados, parmesano y albahaca.",
          },
          {
            name: "Hamburguesa Tribv",
            price: "$61.000",
            desc: "Pan brioche, 150gr de carne angus a término, mermelada de tocino, salsa de queso cheddar, rúgula, vegetales frescos, salsa ryu y papas.",
          },
          {
            name: "Costilla BBQ Chamoy",
            price: "$88.000",
            desc: "Costillas de cerdo marinadas y bañadas en salsa BBQ chamoy de la casa, con papas criollas al romero y limón, ensalada fresca con vinagreta de cilantro y brotes de rábano.",
          },
          {
            name: "Chicharrón de Jabalí",
            price: "$84.000",
            desc: "Tocino en cocción lenta 7 horas y horneado: crocante por fuera, suave por dentro, con guacamole rústico, cebolla encurtida, supremas de naranja y brotes de rábano.",
          },
        ],
      },
      {
        name: "Ensaladas",
        items: [
          {
            name: "Ensalada de Pollo y Camarón",
            price: "$61.000",
            desc: "Salteado de pollo y camarón, tomates cherry en mantequilla de panela, mezcla de lechugas, zanahoria, cebolla encurtida, queso mozzarella, aguacate, vinagreta de cilantro y mix de ajonjolí.",
          },
          {
            name: "Ensalada de Salmón Teriyaki",
            price: "$96.000",
            desc: "Salmón sellado en salsa teriyaki, tomates cherry en mantequilla de panela, mezcla de lechugas, zanahoria, cebolla encurtida, aguacate, mix de ajonjolí, puerro caramelizado y vinagreta de cilantro.",
          },
          {
            name: "Ensalada de Pollo Agridulce",
            price: "$52.000",
            desc: "Salteado de pollo en salsa agridulce, tomates cherry en mantequilla de panela, mezcla de lechugas, zanahoria, cebolla encurtida, aguacate, parmesano, vinagreta de cilantro y mix de ajonjolí.",
          },
        ],
      },
      {
        name: "Adiciones",
        items: [
          { name: "Papas al limón y romero", price: "$16.000" },
          { name: "Papas casco", price: "$16.000" },
          { name: "Patacones con hogao y guacamole", price: "$16.000" },
          { name: "Ensalada fresca", price: "$16.000" },
        ],
      },
    ],
  },

  // ── 4. PIZZAS (masa artesanal) ──
  {
    id: "pizzas",
    name: "Pizzas",
    note: "Masa artesanal tipo italiana, 72 horas de maduración, salsa pomodoro de la casa y especias. Se pueden terminar en la mesa con ajo en polvo, orégano y aceite de oliva (opcional).",
    groups: [
      {
        items: [
          {
            name: "Pizza Vegetariana",
            price: "$58.000",
            desc: "Champiñones, tomates cherry, almendras garapiñadas, reducción de vino tinto, mizclum, queso parmesano y mozzarella.",
          },
          {
            name: "Pizza Pulled Pork",
            price: "$61.000",
            desc: "Pulled pork en BBQ de chamoy de la casa, mermelada de tocino, rúgula y queso mozzarella.",
          },
          {
            name: "Pizza Chicharrón",
            price: "$61.000",
            desc: "Chicharrón caramelizado, cilantro, queso parmesano rallado y queso mozzarella.",
          },
          {
            name: "Pizza Pollo Trufado",
            price: "$61.000",
            desc: "Salsa pomodoro, tomates frescos y hierbas aromáticas, salteado de pollo trufado, tocineta ahumada, variedad de setas y parmesano rallado.",
          },
          {
            name: "Pizza Mediterránea",
            price: "$100.000",
            desc: "Base pesto y mozzarella, chorizo español y pepperoni, jamón serrano y queso paipa, con borde relleno de queso (mozzarella y queso crema).",
          },
          {
            name: "Adición de Borde de Queso",
            price: "$19.000",
            desc: "Queso crema, queso mozzarella.",
          },
        ],
      },
    ],
  },

  // ── 5. SUSHI ROLLS (sushi de autor) ──
  {
    id: "sushi",
    name: "Sushi Rolls",
    image: "/Comidas-2.jpg",
    note: "Precios por porción de 5 bocados / 10 bocados.",
    groups: [
      {
        name: "Semifrescos",
        items: [
          {
            name: "Instinto Roll",
            price: "$94.000",
            desc: "Langostino apanado, palmito marinado en mayonesa japonesa, queso crema y aguacate, arroz en tinta de calamar con topping de langosta en salsa de guankaina tatemada y coco caramelizado.",
          },
          {
            name: "Gorila Roll",
            price: "$35.000 / $59.000",
            desc: "Palmito de cangrejo, aguacate y queso crema, en láminas de salmón fresco, mango y aguacate con tope de salsa de langostino apanado.",
          },
          {
            name: "Snake Roll",
            price: "$35.000 / $65.000",
            desc: "Langostinos apanados, queso crema y aguacate, envuelto en láminas de salmón flambeado, sobre espejo de ají amarillo con remolacha caramelizada, cebollín y salsa teriyaki.",
          },
          {
            name: "Wolf Roll",
            price: "$35.000 / $65.000",
            desc: "Langostinos apanados, palmito de cangrejo y queso crema, en láminas de aguacate con tope de ceviche cremoso de camarón, puerros caramelizados y salsa teriyaki.",
          },
          {
            name: "Panther Roll",
            price: "$43.000 / $65.000",
            desc: "Langostino apanado, queso crema y aguacate, en láminas de plátano maduro con tope de ceviche de chicharrón crocante y aguacate en cubos.",
          },
          {
            name: "Kraken Roll",
            price: "$43.000 / $78.000",
            desc: "Camarón apanado, kakiage tempura y queso crema en láminas de aguacate con salsa octopus, yacón caramelizado y salsa teriyaki.",
          },
          {
            name: "Dragon Roll",
            price: "$43.000 / $78.000",
            desc: "Langostino apanado, palmito de cangrejo y queso crema, en láminas de aguacate con ceviche peruano en salsa de rocoto y salsa teriyaki.",
          },
        ],
      },
      {
        name: "Frescos",
        items: [
          {
            name: "Jaguar Roll",
            price: "$35.000 / $65.000",
            desc: "Palmito de cangrejo y queso crema, en láminas de aguacate con ceviche peruano de pescado blanco en salsa de rocoto y salsa teriyaki.",
          },
          {
            name: "Coyote Roll",
            price: "$39.000 / $70.000",
            desc: "Salmón fresco marinado en aceite de ajonjolí y mayonesa japonesa, masago, cebollín y salsa teriyaki.",
          },
          {
            name: "Grizzly Roll",
            price: "$40.000 / $70.000",
            desc: "Salmón fresco, queso crema y aguacate en quinoa crocante con camarones apanados en salsa agridulce, coco caramelizado y salsa teriyaki.",
          },
          {
            name: "Leopard Roll",
            price: "$43.000 / $78.000",
            desc: "Salmón fresco, palmito de cangrejo y queso crema, en láminas de aguacate con tartar de salmón, semillas de sésamo y salsa teriyaki.",
          },
          {
            name: "Eye of the Tiger",
            price: "$44.000 / $77.000",
            desc: "Salmón, palmito tostado, queso crema y aguacate, en láminas de salmón con mayonesa japonesa y sriracha, salsa teriyaki y mix de ajonjolí.",
          },
        ],
      },
      {
        name: "Vegetariano",
        items: [
          {
            name: "Rhino Roll",
            price: "$24.000 / $41.000",
            desc: "Vegetales tempura, queso crema y aguacate, en láminas de aguacate con ceviche tropical de mango y fresa, yacón caramelizado y salsa teriyaki.",
          },
        ],
      },
      {
        name: "Apanados y tempuras",
        items: [
          {
            name: "Eagle Roll",
            price: "$35.000 / $65.000",
            desc: "Salmón dinamita (cangrejo, wakame y salsas de la casa), aguacate y queso crema, en plátano maduro apanado en panko, con ceviche tropical de frutas, queso caramelizado y salsa teriyaki.",
          },
          {
            name: "Hyena Roll",
            price: "$44.000 / $73.000",
            desc: "Estilo futomaki tempura: palmito marinado en mayonesa de ají amarillo, queso crema y aguacate, con crunch de salmón, cangrejo crocante, salsa de gulupa y salsa teriyaki.",
          },
        ],
      },
    ],
  },

  // ── 6. OKONOMIYAKI ──
  {
    id: "okonomiyaki",
    name: "Okonomiyaki",
    note: "También conocida como la pizza japonesa: una tortilla a base de arroz frito de sushi, hoja de arroz y nuestros ingredientes Tribv.",
    groups: [
      {
        items: [
          {
            name: "Acevichada",
            price: "$54.000",
            desc: "Ceviche de camarón al estilo tribv, aguacate, queso crema, puerro caramelizado, mix de ajonjolí tostado y flor comestible.",
          },
          {
            name: "Dinamita",
            price: "$67.000",
            desc: "Salsa dinamita, aguacate, queso crema y exclusivos ingredientes japoneses (palmito shirakiku, wakame, caviar de cangrejo, mayonesa japonesa, salsa ryu, salsa teriyaki y flor comestible).",
          },
          {
            name: "Salmón Ahumado",
            price: "$63.000",
            desc: "Salmón ahumado, queso crema, aguacate, wakame, palmito de cangrejo marinado en aceite de ajonjolí y salsas de la casa.",
          },
          {
            name: "Octopus",
            price: "$54.000",
            desc: "Mezcla de sabores de mar (pulpo, cangrejo), salsa ryu, queso crema, aguacate, quinoa crocante, salsa teriyaki y flor comestible.",
          },
        ],
      },
    ],
  },

  // ── 7. MENÚ INFANTIL ──
  {
    id: "infantil",
    name: "Menú Infantil",
    note: "Para niños menores de 12 años.",
    groups: [
      {
        items: [
          {
            name: "Lomitos de pollo",
            price: "$36.000",
            desc: "Apanados en panko, con papa smile, salsa rosada y salsa de tomate.",
          },
          {
            name: "Cheese Burguer",
            price: "$36.000",
            desc: "Pan brioche, 80gr de carne a término, queso mozzarella, papa smile y salsa de tomate.",
          },
          {
            name: "Cono Salchipapa",
            price: "$31.000",
            desc: "Salchicha premium y papas a la francesa con salsa de tomate y queso cheddar.",
          },
          {
            name: "Salchipapas Salvajes",
            price: "$34.000",
            desc: "Papa a la francesa, salchicha, mermelada de tocino, queso cheddar, salsa de tomate y rosada.",
          },
        ],
      },
    ],
  },

  // ── 8. POSTRES ──
  {
    id: "postres",
    name: "Postres",
    groups: [
      {
        items: [
          {
            name: "Mundo de Chocolate",
            price: "$67.000",
            desc: "Base de masa madre reposada 72 horas, crema de avellanas, fresa, burbujas de chocolate, chocolatina triturada y helado de vainilla.",
          },
          {
            name: "Milhoja",
            price: "$36.000",
            desc: "Finas hojas de hojaldre sobrepuestas rellenas de crema pastelera, crema bowling y arequipe sobre espejo de durazno, fresa bañada en mermelada de mora caliente y arequipe.",
          },
          {
            name: "Galleta con helado",
            price: "$34.000",
            desc: "Galleta melcochuda con trozos de chocolate y nueces bañada en salsa de chocolate, acompañada de un gelato de vainilla.",
          },
          {
            name: "Fantasía de colores",
            price: "$46.000",
            desc: "Torta red velvet rellena de crema primavera con mix de frutas frescas, chocolate rallado y mermelada de mora caliente.",
          },
          {
            name: "Postre Super Bowling",
            price: "$67.000",
            desc: "Bizcocho de chocolate, caramelo, gelato y ganache de chocolate recubierto con nuestro icónico cilindro de chocolate amargo, perfectamente balanceado en nieve de dulzura.",
          },
        ],
      },
    ],
  },

  // ── 9. COCTELERÍA (autor, clásicos, gin & tonic, mocktails) ──
  {
    id: "cocteles",
    name: "Coctelería",
    note: "Coctelería de autor y clásicos. Pregunta por nuestros rituales: Fuego, Niebla y Ahumado.",
    groups: [
      {
        name: "Brebajes de la Tribv",
        items: [
          {
            name: "Flamingo",
            price: "$75.000",
            tags: ["Dulce", "Herbal", "Refrescante"],
            desc: "Bombay Sapphire, maceración de sandía, jengibre, limón, romero, aromatizado con albahaca y Mil976 jengibre limón.",
          },
          {
            name: "Poporo",
            price: "$75.000",
            tags: ["Intenso", "Refrescante"],
            desc: "Cazadores, Campari, zumo de piña, elixir de arándanos azules y zumo de limón.",
          },
          {
            name: "Calavera de Cristal",
            price: "$85.000",
            tags: ["Intenso", "Picante", "Refrescante"],
            desc: "Patrón Silver, Campari, miel de jalapeños, zumo de toronja rosada, zumo de limón y tajín.",
          },
          {
            name: "Huevo de Fénix",
            price: "$73.000",
            tags: ["Refrescante", "Intenso", "Ahumado"],
            desc: "Mezcal, The Famous Grouse, miel de agave habanero, uchuvas frescas, zumo de limón, hierbabuena y Mil976 ginger beer.",
          },
          {
            name: "Águila",
            price: "$71.000",
            tags: ["Refrescante", "Intenso", "Dulce"],
            desc: "Monkey Shoulder, Absolut raspberri, mandarina, zumo de limón y hierbabuena fresca.",
          },
          {
            name: "Chamán",
            price: "$71.000",
            tags: ["Refrescante", "Intenso", "Dulce"],
            desc: "Bacardi 8 años, Bacardi carta blanca, falernum artesanal, zumo de piña, maracuyá y hierbabuena fresca.",
          },
          {
            name: "Sacrificio",
            price: "$69.000",
            tags: ["Refrescante", "Dulce", "Intenso"],
            desc: "Bacardi carta blanca, Absolut raspberri, puré de melocotones, hibiscus y hierbabuena fresca.",
          },
          {
            name: "Sangre de la Tribv",
            price: "$250.000",
            tags: ["Para compartir", "Dulce", "Frutal"],
            desc: "Bebida bañada en oro para compartir: vino rosado o tinto, soho, Bacardi añejo, lychees, ginger ale, hierbabuena y manzana verde.",
          },
        ],
      },
      {
        name: "Clásicos de la Tribu",
        items: [
          {
            name: "Porn Star Martini",
            price: "$62.000",
            tags: ["Dulce", "Refrescante"],
            desc: "Skyy, elixir de vainilla, passion fruit, espuma de rosas y prosecco.",
          },
          {
            name: "Moscow Mule",
            price: "Skyy $50.000 · Grey Goose $75.000",
            tags: ["Refrescante", "Picante"],
            desc: "Vodka, zumo de limón, elixir de jengibre tamarindo y espuma de jengibre tamarindo.",
          },
          {
            name: "Penicillin",
            price: "Famous Grouse $50.000 · Monkey Shoulder $62.000",
            tags: ["Refrescante", "Picante"],
            desc: "Scotch whisky, zumo de limón, elixir de jengibre tamarindo y miel de jalapeños.",
          },
          {
            name: "Bramble",
            price: "$62.000",
            tags: ["Refrescante", "Dulce"],
            desc: "Bombay Sapphire, almíbar de caña, zumo de limón y paleta de frambuesa.",
          },
        ],
      },
      {
        name: "Clásicos",
        items: [
          {
            name: "Dry Martini",
            price: "Bombay $60.000 · Hendrick's $77.000",
            tags: ["Intenso", "Seco"],
            desc: "Martini Extra Dry, perfume de cítricos y aceitunas verdes.",
          },
          {
            name: "Margarita",
            price: "Cazadores $52.000 · Patrón $79.000 · Cristalino $120.000",
            tags: ["Intenso", "Salino"],
            desc: "Tequila, triple sec, zumo de limón, sal y tajín.",
          },
          {
            name: "Lychee Martini",
            price: "Skyy $52.000 · Grey Goose $80.000",
            tags: ["Intenso", "Dulce"],
            desc: "Skyy, licor soho lychees y almíbar de lychees.",
          },
          {
            name: "Mojito Cubano",
            price: "Bacardi blanca $52.000 · Bacardi 8 años $73.000",
            tags: ["Refrescante", "Dulce"],
            desc: "Ron, hierbabuena fresca, zumo de limón y almíbar de caña.",
          },
          {
            name: "Old Fashioned",
            price: "JD #7 $54.000 · JD Single Barrel $85.000",
            tags: ["Intenso", "Dulce"],
            desc: "Jack Daniel's, Angostura bitters, azúcar y piel de naranja.",
          },
          {
            name: "Negroni",
            price: "$54.000",
            tags: ["Intenso", "Herbal", "Amargo"],
            desc: "Bombay Sapphire, Martini rosso y Campari.",
          },
          {
            name: "Aperol Spritz",
            price: "$45.000",
            tags: ["Refrescante", "Herbal", "Dulce"],
            desc: "Aperol, Prosecco y soda.",
          },
          {
            name: "Paloma",
            price: "$75.000",
            tags: ["Refrescante", "Dulce"],
            desc: "Patrón Reposado, Mil 976 Toronja, zumo de limón fresco, sal y tajín.",
          },
        ],
      },
      {
        name: "Gin & Tonic by Tribu",
        items: [
          {
            name: "Hendrick's Tonic",
            price: "$75.000",
            tags: ["Fresca", "Tradicional"],
            desc: "Hendrick's, pepino europeo, coriandro y tónica.",
          },
          {
            name: "Bombay Tonic",
            price: "$62.000",
            tags: ["Cítrico", "Perfumado"],
            desc: "Bombay Sapphire, mix cítricos deshidratados y tónica.",
          },
          {
            name: "Passion Bombay Tonic",
            price: "$62.000",
            tags: ["Herbal", "Dulce", "Frutal"],
            desc: "Bombay Sapphire, albahaca, passion fruit y tónica.",
          },
        ],
      },
      {
        name: "Mocktails (sin alcohol)",
        items: [
          { name: "Passion Mule", price: "$32.000", desc: "Elixir de maracuyá, zumo de limón y Mil 976 ginger beer." },
          { name: "Coco Lychee", price: "$35.000", desc: "Extracto de lychees, zumo de piña y crema de coco." },
          { name: "Virgin Mojito", price: "$32.000", desc: "Hatsu, hierbabuena fresca, zumo de limón y almíbar de caña." },
          { name: "Red Bull Limonade", price: "$37.000", desc: "Red Bull granizado con limón e infusión de hibiscus." },
        ],
      },
    ],
  },

  // ── 10. LICORES (whisky, vodka, ginebra, tequila, ron, mezcal, cognac, aguardiente, vinos, champaña, cervezas) ──
  {
    id: "licores",
    name: "Licores",
    note: "Servicio por botella (B) y por trago (T).",
    groups: [
      {
        name: "Whisky — Single Malt",
        items: [
          { name: "Glenfiddich 12", price: "B $490.000 · T $49.000" },
          { name: "Glenfiddich 15", price: "B $545.000 · T $54.000" },
          { name: "Glenfiddich 18", price: "B $914.000 · T $91.000" },
          { name: "Glenmorangie Original", price: "B $610.000 · T $61.000" },
          { name: "Glenmorangie La Santa 12", price: "B $750.000 · T $75.000" },
          { name: "Glenmorangie Quinta Ruban 14", price: "B $790.000 · T $79.000" },
          { name: "Glenmorangie Nectar D'or", price: "B $790.000 · T $79.000" },
          { name: "Glenmorangie 18", price: "B $2.090.000 · T $209.000" },
        ],
      },
      {
        name: "Whisky — Blended & Americano/Irlandés",
        items: [
          { name: "Monkey Shoulder", price: "B $510.000 · T $51.000" },
          { name: "Buchanan's Master", price: "B $550.000 · T $55.000" },
          { name: "Buchanan's 12", price: "B $490.000 · T $49.000" },
          { name: "Old Parr 12", price: "B $490.000 · T $48.000" },
          { name: "Jack Daniel's N.º 7", price: "B $390.000 · T $39.000" },
          { name: "Jack Daniel's Honey", price: "B $440.000 · T $44.000" },
          { name: "Gentleman Jack", price: "B $490.000 · T $49.000" },
          { name: "Jack Daniel's Single Barrel", price: "B $790.000 · T $79.000" },
        ],
      },
      {
        name: "Vodka",
        items: [
          { name: "Grey Goose", price: "B $650.000 · T $65.000" },
          { name: "Skyy", price: "B $310.000 · T $31.000" },
          { name: "Absolut", price: "B $340.000 · T $34.000" },
          { name: "Smirnoff Tamarindo", price: "B $220.000 · T $22.000" },
        ],
      },
      {
        name: "Ginebra",
        items: [
          { name: "Bombay Sapphire", price: "B $448.000 · T $45.000" },
          { name: "Beefeater 24", price: "B $680.000 · T $68.000" },
          { name: "Beefeater Dry", price: "B $580.000 · T $58.000" },
          { name: "Monkey 47", price: "B $710.000 · T $71.000" },
          { name: "Tanqueray Ten", price: "B $670.000 · T $67.000" },
          { name: "Tanqueray Rangpur", price: "B $490.000 · T $49.000" },
          { name: "Tanqueray London Dry", price: "B $450.000 · T $45.000" },
          { name: "Hendrick's", price: "B $590.000 · T $59.000" },
        ],
      },
      {
        name: "Tequila & Mezcal",
        items: [
          { name: "Patrón Silver", price: "B $720.000 · T $72.000" },
          { name: "Patrón Reposado", price: "B $780.000 · T $78.000" },
          { name: "Patrón Cristalino", price: "B $890.000 · T $89.000" },
          { name: "Jimador Blanco", price: "B $360.000 · T $36.000" },
          { name: "Jimador Reposado", price: "B $380.000 · T $38.000" },
          { name: "Jimador Cristalino", price: "B $520.000 · T $52.000" },
          { name: "Cazadores Silver", price: "B $340.000 · T $34.000" },
          { name: "Cazadores Reposado", price: "B $340.000 · T $34.000" },
          { name: "Don Julio Blanco", price: "B $760.000 · T $76.000" },
          { name: "Don Julio Reposado", price: "B $800.000 · T $80.000" },
          { name: "Don Julio 70", price: "B $980.000 · T $98.000" },
          { name: "Dobel Diamante", price: "B $910.000 · T $91.000" },
          { name: "Mezcal Unión", price: "B $600.000 · T $61.000" },
        ],
      },
      {
        name: "Ron, Cognac & Aguardiente",
        items: [
          { name: "Bacardi Añejo 8", price: "B $390.000 · T $39.000" },
          { name: "Viejo de Caldas", price: "B $245.000 · T $24.000" },
          { name: "Hechicera", price: "B $500.000 · T $50.000" },
          { name: "Havanna 7", price: "B $420.000 · T $42.000" },
          { name: "Hennessy Very Special", price: "B $640.000 · T $64.000" },
          { name: "Antioqueño Rojo / Verde", price: "B $220.000 · M $125.000 · T $22.000" },
          { name: "Antioqueño Azul", price: "B $220.000 · M $125.000 · T $25.000" },
        ],
      },
      {
        name: "Licores especiales",
        items: [
          { name: "Jägermeister", price: "B $390.000 · T $39.000" },
          { name: "Baileys", price: "B $270.000 · T $27.000" },
          { name: "Amaretto Disaronno", price: "B $420.000 · T $42.000" },
        ],
      },
      {
        name: "Vinos",
        items: [
          { name: "Tarapacá Reserva Merlot (Chile) — tinto", price: "B $230.000" },
          { name: "Ramón Bilbao Crianza Tempranillo (Rioja, España) — tinto", price: "B $284.000" },
          { name: "Los Intocables Malbec (Argentina) — tinto", price: "B $319.000" },
          { name: "Mar de Frades Albariño (Rías Baixas, España) — blanco", price: "B $506.000" },
        ],
      },
      {
        name: "Champaña",
        items: [
          { name: "Veuve Clicquot Brut", price: "B $1.029.000" },
          { name: "Dom Pérignon Brut", price: "B $2.420.000" },
          { name: "Moët Chandon Rosé", price: "B $1.030.000" },
          { name: "JP Chenet Rosé", price: "B $220.000" },
          { name: "Chandon Brut", price: "B $290.000" },
          { name: "Chandon Rosé", price: "B $315.000" },
        ],
      },
      {
        name: "Cervezas",
        note: "Servicio por botella.",
        items: [
          { name: "Corona", price: "$22.000" },
          { name: "Stella Artois", price: "$22.000" },
          { name: "Club Colombia Dorada", price: "$20.000" },
          { name: "Cusqueña", price: "$20.000" },
          { name: "Heineken", price: "$18.000" },
        ],
      },
    ],
  },

  // ── 11. SIN ALCOHOL (sodas, malteadas, jugos, limonadas, cafés, pasantes) ──
  {
    id: "sin-alcohol",
    name: "Sin Alcohol",
    groups: [
      {
        name: "Sodas saborizadas",
        items: [
          { name: "Maracuyá Hierbabuena", price: "$20.000" },
          { name: "Jengibre Albahaca", price: "$20.000" },
          { name: "Frutos Rojos Romero", price: "$20.000" },
        ],
      },
      {
        name: "Malteadas, jugos y limonadas",
        items: [
          { name: "Malteada de Vainilla", price: "$34.000" },
          { name: "Malteada de Chocolate", price: "$34.000" },
          { name: "Jugo de temporada", price: "$15.000" },
          { name: "Limonada de coco", price: "$18.000" },
          { name: "Limonada de hierbabuena", price: "$15.000" },
          { name: "Limonada natural", price: "$15.000" },
        ],
      },
      {
        name: "Cafés",
        items: [
          { name: "Espresso", price: "$11.000" },
          { name: "Americano", price: "$11.000" },
          { name: "Capuchino", price: "$15.000" },
          { name: "Latte", price: "$15.000" },
          { name: "Carajillo", price: "$35.000", tags: ["Dulce"], desc: "Licor 43, espresso." },
        ],
      },
      {
        name: "Pasantes y gaseosas",
        items: [
          { name: "Red Bull", price: "$24.000" },
          { name: "Red Bull Sugarfree", price: "$24.000" },
          { name: "Red Bull Red Edition", price: "$24.000" },
          { name: "Pepsi / Pepsi Zero", price: "$11.000" },
          { name: "Colombiana / Sin Azúcar", price: "$11.000" },
          { name: "Soda Bretaña", price: "$11.000" },
          { name: "Tónica / Ginger Ale (Canada Dry)", price: "$11.000" },
          { name: "Agua Hatsu / Hatsu Gas", price: "$11.000" },
          { name: "Té 976 (Blanco, Negro, Amarillo, Violeta)", price: "$15.000" },
          { name: "Mil976 (Indi, Ocean, Ginger Beer, Pink, Jengibre Limón)", price: "$20.000" },
          { name: "San Pellegrino", price: "$28.000" },
        ],
      },
    ],
  },
];

/** Ruta pública de la carta en PDF (copia local, no depende de enlaces firmados). */
export const MENU_PDF = "/assets/carta-super-bowling.pdf";
