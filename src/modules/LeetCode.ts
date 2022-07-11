import { NS } from "Bitburner";
import { TermLogger } from "lib/Helpers";
import { SInfo } from "lib/Servers";

import { FindLPF } from "coding_contracts/find_lpf";
import { SubarrayMaxSum } from "coding_contracts/subarray_max_sum";
import { TotalWaysToSum } from "coding_contracts/total_ways_to_sum_1";
import { TotalWaysToSum2 } from "coding_contracts/total_ways_to_sum_2";
import { SpiralizeMatrix } from "coding_contracts/spiralize_matrix";
import { ArrayJumping1 } from "coding_contracts/array_jumping";
import { ArrayJumping2 } from "coding_contracts/array_jumping";
import { MergeOverlapping } from "coding_contracts/merge_overlapping";
import { GenerateIP } from "coding_contracts/generate_ip";
import { StockTrader1, StockTrader2, StockTrader3, StockTrader4 } from "coding_contracts/stock_trader_universal";
import { MinPathSumTriangle } from "coding_contracts/min_path_sum_triangle";
import { UniquePathsGrid1 } from "coding_contracts/unique_paths_grid_1";
import { UniquePathsGrid2 } from "coding_contracts/unique_paths_grid_2";
import { ShortestPathGrid } from "coding_contracts/shortest_path_grid";
import { SanitizeParens } from "coding_contracts/sanitize_parens";
import { FindValidMath } from "coding_contracts/find_valid_math_expr";
import { HammingEncode } from "coding_contracts/hammingcodes_encode";
import { HammingDecode } from "coding_contracts/hammingcodes_error";
import { TwoColoringGraph } from "coding_contracts/two_coloring_graph";
import { RLECompression } from "coding_contracts/compression_1";
import { LZDecompression } from "coding_contracts/compression_2";
import { LZCompression } from "coding_contracts/compression_3";

export const attemptContract = (name: string, data: any) => {
    switch (name) {
        case "Find Largest Prime Factor":
            return FindLPF.answer(data);
        case "Subarray with Maximum Sum":
            return SubarrayMaxSum.answer(data);
        case "Total Ways to Sum":
            return TotalWaysToSum.answer(data);
        case "Total Ways to Sum II":
            return TotalWaysToSum2.answer(data);
        case "Spiralize Matrix":
            return SpiralizeMatrix.answer(data);
        case "Array Jumping Game":
            return ArrayJumping1.answer(data);
        case "Array Jumping Game II":
            return ArrayJumping2.answer(data);
        case "Merge Overlapping Intervals":
            return MergeOverlapping.answer(data);
        case "Generate IP Addresses":
            return GenerateIP.answer(data);
        case "Algorithmic Stock Trader I":
            return StockTrader1.answer(data);
        case "Algorithmic Stock Trader II":
            return StockTrader2.answer(data);
        case "Algorithmic Stock Trader III":
            return StockTrader3.answer(data);
        case "Algorithmic Stock Trader IV":
            return StockTrader4.answer(data);
        case "Minimum Path Sum in a Triangle":
            return MinPathSumTriangle.answer(data);
        case "Unique Paths in a Grid I":
            return UniquePathsGrid1.answer(data);
        case "Unique Paths in a Grid II":
            return UniquePathsGrid2.answer(data);
        case "Shortest Path in a Grid":
            return ShortestPathGrid.answer(data);
        case "Sanitize Parentheses in Expression":
            return SanitizeParens.answer(data);
        case "Find All Valid Math Expressions":
            return FindValidMath.answer(data);
        case "HammingCodes: Integer to Encoded Binary":
            return HammingEncode.answer(data);
        case "HammingCodes: Encoded Binary to Integer":
            return HammingDecode.answer(data);
        case "Proper 2-Coloring of a Graph":
            return TwoColoringGraph.answer(data);
        case "Compression I: RLE Compression":
            return RLECompression.answer(data);
        case "Compression II: LZ Decompression":
            return LZDecompression.answer(data);
        case "Compression III: LZ Compression":
            return LZCompression.answer(data);
        default:
            return null
    }
}

export const LeetCode = {
    async init(ns: NS) {
        const logger = new TermLogger(ns);
        logger.log("LeetCode Enabled")

        try {
            FindLPF.tests(95)
            logger.log("OK\tFindLPF")
        } catch { logger.err("ERR\tFindLPF") }

        try {
            SubarrayMaxSum.tests([1])
            logger.log("OK\tSubarryMaxSum")
        } catch { logger.err("ERR\tSubarrayMaxSum") }

        try {
            TotalWaysToSum.tests(20)
            logger.log("OK\tTotalWaysToSum")
        } catch { logger.err("ERR\tTotalWaysToSum") }

        try {
            TotalWaysToSum2.tests([10, [2, 5, 8]])
            logger.log("OK\tTotalWaysToSum2")
        } catch { logger.err("ERR\tTotalWaysToSum2") }

        try {
            SpiralizeMatrix.tests([[0, 1, 2], [3, 4, 5]])
            logger.log("OK\tSpiralizeMatrix")
        } catch { logger.err("ERR\tSpiralizeMatrix") }

        try {
            ArrayJumping1.tests([0, 0, 5])
            logger.log("OK\tArrayJumping1")
        } catch { logger.err("ERR\tArrayJumping1") }

        try {
            ArrayJumping2.tests([0, 0, 5])
            logger.log("OK\tArrayJumping2")
        } catch { logger.err("ERR\tArrayJumping2") }

        try {
            MergeOverlapping.tests([[1, 3], [2, 6], [8, 10], [15, 18]])
            logger.log("OK\tMergeOverlapping")
        } catch { logger.err("ERR\tMergeOverlapping") }

        try {
            GenerateIP.tests("0000")
            logger.log("OK\tGenerateIP")
        } catch { logger.err("ERR\tGenerateIP") }

        try {
            StockTrader1.tests([1, 2, 3, 4, 5])
            logger.log("OK\tStockTrader1")
        } catch { logger.err("ERR\tStockTrader1") }

        try {
            StockTrader2.tests([1, 2, 3, 4, 5])
            logger.log("OK\tStockTrader2")
        } catch { logger.err("ERR\tStockTrader2") }

        try {
            StockTrader3.tests([1, 2, 3, 4, 5])
            logger.log("OK\tStockTrader3")
        } catch  { logger.err("ERR\tStockTrader3") }

        try {
            StockTrader4.tests([2, [2, 4, 1]])
            logger.log("OK\tStockTrader4")
        } catch { logger.err("ERR\tStockTrader4") }

        try {
            MinPathSumTriangle.tests([[-10]])
            logger.log("OK\tMinPathSumTriangle")
        } catch { logger.err("ERR\tMinPathSumTriangle") }

        try {
            UniquePathsGrid1.tests([2, 3])
            logger.log("OK\tUniquePathsGrid1")
        } catch { logger.err("ERR\tUniquePathsGrid1") }

        try {
            UniquePathsGrid2.tests([[0, 0, 0], [0, 1, 0], [0, 0, 0]])
            logger.log("OK\tUniquePathsGrid2")
        } catch { logger.err("ERR\tUniquePathsGrid2") }

        try {
            ShortestPathGrid.tests([[0, 0], [1, 0]])
            logger.log("OK\tShortestPathGrid")
        } catch { logger.err("ERR\tShortestPathGrid") }

        try {
            SanitizeParens.tests(")(")
            logger.log("OK\tSanitizeParens")
        } catch { logger.err("ERR\tSanitizeParens") }

        try {
            FindValidMath.tests(['123', 6])
            logger.log("OK\tFindValidMath")
        } catch { logger.err("ERR\tFindValidMath") }

        try {
            HammingDecode.tests('01011010')
            logger.log("OK\tHammingDecode")
        } catch { logger.err("ERR\tHammingDecode") }

        try {
            HammingEncode.tests(42)
            logger.log("OK\tHammingEncode")
        } catch { logger.err("ERR\tHammingEncode") }

        try {
            TwoColoringGraph.tests([4, [[0, 2], [0, 3], [1, 2], [1, 3]]])
            logger.log("OK\tTwoColoringGraph")
        } catch { logger.err("ERR\tTwoColoringGraph") }
        
        try {
            RLECompression.tests('aaaaabccc')
            logger.log("OK\tRLECompression")
        } catch { logger.err("ERR\tRLECompression") }
        
        try {
            LZDecompression.tests('5aaabb450723abb')
            logger.log("OK\tLZDecompression")
        } catch { logger.err("ERR\tLZDecompression") }
        
        try {
            LZCompression.tests('abracadabra')
            logger.log("OK\tLZCompression")
        } catch { logger.err("ERR\tLZCompression") }

    },

    async loop(ns: NS) {
        let servers = SInfo.all(ns);

        while (true) {
            for (const server of servers) {
                if (ns.ls(server.id, ".cct").length > 0) {
                    let contractName = ns.ls(server.id, ".cct")[0];
                    let contractData = ns.codingcontract.getData(contractName, server.id);
                    let contractType = ns.codingcontract.getContractType(contractName, server.id);

                    let solution: any;
                    try {
                        solution = attemptContract(contractType, contractData);
                    } catch (e) { }

                    if (solution) {
                        ns.tprint(ns.codingcontract.attempt(solution, contractName, server.id, { returnReward: true }))
                    }
                }
            }
            await ns.asleep(80000);
        }
    }
}

