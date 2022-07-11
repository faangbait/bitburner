import { RLECompression } from "../compression_1";

test('basic', () => {
    expect(RLECompression.solve('aaaaabccc')).toBe('5a1b3c')
    expect(RLECompression.solve('aAaAaA')).toBe('1a1A1a1A1a1A')
})

test('tests', () => {
    expect(RLECompression.solve('111112333')).toBe('511233')
})
