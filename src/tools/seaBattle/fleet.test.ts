import { describe, expect, it } from 'vitest'
import { columnLabel, exampleShot, fleetFor, rowLabel, shipSquares, type GridSize } from './fleet'

describe('sea battle', () => {
  for (const size of [5, 8, 10] as GridSize[]) {
    it(`gives a ${size}×${size} fleet that fits with room to hide`, () => {
      const fleet = fleetFor(size)
      for (const ship of fleet) {
        expect(ship.length).toBeGreaterThanOrEqual(2)
        expect(ship.length).toBeLessThanOrEqual(size) // every ship fits in a row or column
      }
      // ships cover well under half the grid, so the game is not too easy
      expect(shipSquares(fleet)).toBeLessThan((size * size) / 3 + 1)
      expect(shipSquares(fleet)).toBeGreaterThan(0)
    })
  }

  it('has bigger fleets on bigger grids', () => {
    expect(fleetFor(5).length).toBeLessThan(fleetFor(10).length)
    expect(shipSquares(fleetFor(5))).toBeLessThan(shipSquares(fleetFor(8)))
    expect(shipSquares(fleetFor(8))).toBeLessThan(shipSquares(fleetFor(10)))
  })

  it('labels columns with letters or numbers and rows with numbers', () => {
    expect(columnLabel(0, 'letters')).toBe('A')
    expect(columnLabel(9, 'letters')).toBe('J')
    expect(columnLabel(0, 'numbers')).toBe('1')
    expect(columnLabel(9, 'numbers')).toBe('10')
    expect(rowLabel(0)).toBe('1')
    expect(rowLabel(9)).toBe('10')
  })

  it('shows a sample shot in the right style', () => {
    expect(exampleShot('letters')).toBe('C4')
    expect(exampleShot('numbers')).toBe('3, 4')
  })
})
