export interface GearProduct {
  name: string;
}

export interface GearBrand {
  brand: string;
  products: GearProduct[];
}

export type GearCategoryKey = 'mouse' | 'keyboard' | 'headset' | 'monitor' | 'mousepad';

export type GearCatalog = Record<GearCategoryKey, GearBrand[]>;

export const GEAR_CATALOG: GearCatalog = {
  mouse: [
    {
      brand: 'Logitech',
      products: [
        { name: 'G Pro X Superlight' },
        { name: 'G Pro X Superlight 2' },
        { name: 'G502 X' },
      ],
    },
    {
      brand: 'Razer',
      products: [
        { name: 'Viper V2 Pro' },
        { name: 'DeathAdder V3' },
        { name: 'Viper Mini' },
      ],
    },
    {
      brand: 'Zowie',
      products: [
        { name: 'EC2' },
        { name: 'S2' },
        { name: 'FK2' },
      ],
    },
    {
      brand: 'Finalmouse',
      products: [
        { name: 'UltralightX' },
      ],
    },
    {
      brand: 'Pulsar',
      products: [
        { name: 'X2' },
        { name: 'X2V2' },
      ],
    },
    {
      brand: 'Lamzu',
      products: [
        { name: 'Atlantis' },
      ],
    },
    {
      brand: 'Endgame Gear',
      products: [
        { name: 'OP1we' },
      ],
    },
  ],

  keyboard: [
    {
      brand: 'Wooting',
      products: [
        { name: '60HE' },
        { name: '80HE' },
      ],
    },
    {
      brand: 'Razer',
      products: [
        { name: 'Huntsman V3 Pro' },
      ],
    },
    {
      brand: 'HyperX',
      products: [
        { name: 'Alloy Origins' },
      ],
    },
    {
      brand: 'Corsair',
      products: [
        { name: 'K70' },
      ],
    },
    {
      brand: 'SteelSeries',
      products: [
        { name: 'Apex Pro' },
      ],
    },
  ],

  headset: [
    {
      brand: 'HyperX',
      products: [
        { name: 'Cloud Alpha' },
        { name: 'Cloud II' },
      ],
    },
    {
      brand: 'SteelSeries',
      products: [
        { name: 'Arctis Nova Pro' },
      ],
    },
    {
      brand: 'Logitech',
      products: [
        { name: 'G Pro X 2' },
      ],
    },
    {
      brand: 'Razer',
      products: [
        { name: 'BlackShark V2' },
      ],
    },
    {
      brand: 'Sennheiser',
      products: [
        { name: 'HD560S' },
        { name: 'PC38X' },
      ],
    },
  ],

  monitor: [
    {
      brand: 'BenQ',
      products: [
        { name: 'XL2546K' },
        { name: 'XL2546X' },
        { name: 'XL2411K' },
      ],
    },
    {
      brand: 'ASUS',
      products: [
        { name: 'VG259QM' },
        { name: 'PG27AQN' },
      ],
    },
    {
      brand: 'Samsung',
      products: [
        { name: 'Odyssey G7' },
      ],
    },
    {
      brand: 'LG',
      products: [
        { name: '27GP850' },
      ],
    },
    {
      brand: 'Acer',
      products: [
        { name: 'XV252Q F' },
      ],
    },
  ],

  mousepad: [
    {
      brand: 'Artisan',
      products: [
        { name: 'Hien' },
        { name: 'Zero' },
        { name: 'Hayate Otsu' },
      ],
    },
    {
      brand: 'LGG',
      products: [
        { name: 'Saturn' },
        { name: 'Venus' },
      ],
    },
    {
      brand: 'Lethal Gaming Gear',
      products: [
        { name: 'Mercury' },
      ],
    },
    {
      brand: 'Vaxee',
      products: [
        { name: 'PA' },
        { name: 'PB' },
      ],
    },
    {
      brand: 'Zowie',
      products: [
        { name: 'G-SR' },
        { name: 'G-SR-SE' },
      ],
    },
  ],
};
