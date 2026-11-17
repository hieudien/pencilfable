export interface PictureColor {
  name: string
  hex: string
}

export interface Picture {
  id: string
  name: string
  /** colors[0] is the answer "1", colors[1] is the answer "2", … */
  colors: PictureColor[]
  /** 12 rows × 12 characters. Each digit is the answer number (= color) of that square. */
  rows: string[]
}

export const SIZE = 12

export const PICTURES: Picture[] = [
  {
    id: 'heart',
    name: 'Heart',
    colors: [{ name: 'Light blue', hex: '#bae6fd' }, { name: 'Red', hex: '#ef4444' }, { name: 'Pink', hex: '#f9a8d4' }],
    rows: [
      '111111111111',
      '112221122211',
      '122222222221',
      '122322222221',
      '122322222221',
      '122222222221',
      '112222222211',
      '111222222111',
      '111122221111',
      '111112211111',
      '111111111111',
      '111111111111',
    ],
  },
  {
    id: 'star',
    name: 'Star',
    colors: [{ name: 'Dark blue', hex: '#1e3a8a' }, { name: 'Yellow', hex: '#facc15' }, { name: 'Orange', hex: '#f97316' }],
    rows: [
      '111111111111',
      '111112211111',
      '111112211111',
      '111122221111',
      '122222222221',
      '112223322211',
      '111223322111',
      '111222222111',
      '112222222211',
      '112221122211',
      '112211112211',
      '111111111111',
    ],
  },
  {
    id: 'smile',
    name: 'Smiley',
    colors: [{ name: 'Light blue', hex: '#bae6fd' }, { name: 'Yellow', hex: '#fde047' }, { name: 'Brown', hex: '#78350f' }],
    rows: [
      '111122221111',
      '112222222211',
      '122222222221',
      '122322223221',
      '122322223221',
      '122222222221',
      '123222222321',
      '122233332221',
      '122222222221',
      '112222222211',
      '111222222111',
      '111122221111',
    ],
  },
  {
    id: 'house',
    name: 'House',
    colors: [{ name: 'Sky blue', hex: '#bae6fd' }, { name: 'Red', hex: '#dc2626' }, { name: 'Tan', hex: '#fcd34d' }, { name: 'Brown', hex: '#78350f' }],
    rows: [
      '111112211111',
      '111122221111',
      '111222222111',
      '112222222211',
      '122222222221',
      '111333333111',
      '111343343111',
      '111333333111',
      '111334433111',
      '111334433111',
      '111334433111',
      '111111111111',
    ],
  },
  {
    id: 'fish',
    name: 'Fish',
    colors: [{ name: 'Blue', hex: '#7dd3fc' }, { name: 'Orange', hex: '#fb923c' }, { name: 'White', hex: '#ffffff' }, { name: 'Dark orange', hex: '#c2410c' }],
    rows: [
      '111111111111',
      '111111111111',
      '111122211111',
      '112222222114',
      '122322222244',
      '122222222444',
      '122222222244',
      '112222222114',
      '111222222111',
      '111111111111',
      '111111111111',
      '111111111111',
    ],
  },
  {
    id: 'flower',
    name: 'Flower',
    colors: [{ name: 'Sky blue', hex: '#bae6fd' }, { name: 'Pink', hex: '#f472b6' }, { name: 'Yellow', hex: '#facc15' }, { name: 'Green', hex: '#16a34a' }],
    rows: [
      '111122221111',
      '111222222111',
      '112223322211',
      '112233332211',
      '112233332211',
      '112223322211',
      '111222222111',
      '111122221111',
      '111114411111',
      '111444411111',
      '111114411111',
      '111114411111',
    ],
  },
]

export const byId = (id: string): Picture => PICTURES.find((p) => p.id === id) ?? PICTURES[0]
