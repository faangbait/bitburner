import { TwoColoringGraph } from "../two_coloring_graph";
test('basic', () => {
    expect(TwoColoringGraph.solve([3, [[0, 1], [0, 2], [1, 2]]])).toStrictEqual([])
})

test('tests', () => {
    expect(TwoColoringGraph.answer([4, [[0, 2], [0, 3], [1, 2], [1, 3]]])).toStrictEqual([0,0,1,1])
})
