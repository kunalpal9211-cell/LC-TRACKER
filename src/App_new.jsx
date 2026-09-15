import { useState, useMemo, useEffect, useRef } from "react";

// All problems keyed by slug (stable ID = slug, no crash on reorder)
const PROBLEMS_RAW = [
  // ── Original problems ──
  { num: 300,   name: "Longest Increasing Subsequence",                         slug: "longest-increasing-subsequence",                              topic: "Segment Tree", difficulty: "Medium" },
  { num: 1531,  name: "String Compression II",                                   slug: "string-compression-ii",                                      topic: "DP", difficulty: "Hard" },
  { num: 2187,  name: "Minimum Time to Complete Trips",                          slug: "minimum-time-to-complete-trips",                             topic: "Binary Search", difficulty: "Medium" },
  { num: 2188,  name: "Minimum Time to Finish the Race",                         slug: "minimum-time-to-finish-the-race",                            topic: "DP", difficulty: "Hard" },
  { num: 2203,  name: "Minimum Weighted Subgraph With the Required Paths",       slug: "minimum-weighted-subgraph-with-the-required-paths",          topic: "Graph", difficulty: "Hard" },
  { num: 2209,  name: "Minimum White Tiles After Covering With Carpets",         slug: "minimum-white-tiles-after-covering-with-carpets",            topic: "DP", difficulty: "Hard" },
  { num: 2213,  name: "Longest Substring of One Repeating Character",            slug: "longest-substring-of-one-repeating-character",               topic: "Segment Tree", difficulty: "Medium" },
  { num: 2218,  name: "Maximum Value of K Coins From Piles",                     slug: "maximum-value-of-k-coins-from-piles",                        topic: "DP", difficulty: "Hard" },
  { num: 2223,  name: "Sum of Scores of Built Strings",                          slug: "sum-of-scores-of-built-strings",                             topic: "String", difficulty: "Hard" },
  { num: 2227,  name: "Encrypt and Decrypt Strings",                             slug: "encrypt-and-decrypt-strings",                                topic: "Trie", difficulty: "Hard" },
  { num: 2234,  name: "Maximum Total Beauty of the Gardens",                     slug: "maximum-total-beauty-of-the-gardens",                        topic: "Greedy", difficulty: "Hard" },
  { num: 2241,  name: "Design an ATM Machine",                                   slug: "design-an-atm-machine",                                      topic: "Design", difficulty: "Medium" },
  { num: 2242,  name: "Maximum Score of a Node Sequence",                        slug: "maximum-score-of-a-node-sequence",                           topic: "Graph", difficulty: "Hard" },
  { num: 2245,  name: "Maximum Trailing Zeros in a Cornered Path",               slug: "maximum-trailing-zeros-in-a-cornered-path",                  topic: "Prefix Sum", difficulty: "Medium" },
  { num: 2246,  name: "Longest Path With Different Adjacent Characters",          slug: "longest-path-with-different-adjacent-characters",            topic: "Tree", difficulty: "Medium" },
  { num: 2251,  name: "Number of Flowers in Full Bloom",                         slug: "number-of-flowers-in-full-bloom",                            topic: "Binary Search", difficulty: "Hard" },
  { num: 2258,  name: "Escape the Spreading Fire",                               slug: "escape-the-spreading-fire",                                  topic: "BFS", difficulty: "Hard" },
  { num: 2262,  name: "Total Appeal of A String",                                slug: "total-appeal-of-a-string",                                   topic: "DP", difficulty: "Hard" },
  { num: 2267,  name: "Check if There Is a Valid Parentheses String Path",       slug: "check-if-there-is-a-valid-parentheses-string-path",          topic: "DP", difficulty: "Medium" },
  { num: 2271,  name: "Maximum White Tiles Covered by a Carpet",                 slug: "maximum-white-tiles-covered-by-a-carpet",                    topic: "Binary Search", difficulty: "Medium" },
  { num: 2276,  name: "Count Integers in Intervals",                             slug: "count-integers-in-intervals",                                topic: "Segment Tree", difficulty: "Hard" },
  { num: 2280,  name: "Minimum Lines to Represent a Line Chart",                 slug: "minimum-lines-to-represent-a-line-chart",                    topic: "Math", difficulty: "Medium" },
  { num: 2286,  name: "Booking Concert Tickets in Groups",                       slug: "booking-concert-tickets-in-groups",                          topic: "Segment Tree", difficulty: "Hard" },
  { num: 2289,  name: "Steps to Make Array Non-decreasing",                      slug: "steps-to-make-array-non-decreasing",                         topic: "Stack", difficulty: "Medium" },
  { num: 2290,  name: "Minimum Obstacle Removal to Reach Corner",                slug: "minimum-obstacle-removal-to-reach-corner",                   topic: "Graph", difficulty: "Hard" },
  { num: 2295,  name: "Replace Elements in an Array",                            slug: "replace-elements-in-an-array",                               topic: "Hashing", difficulty: "Medium" },
  { num: 2296,  name: "Design a Text Editor",                                    slug: "design-a-text-editor",                                       topic: "Design", difficulty: "Hard" },
  { num: 2302,  name: "Count Subarrays With Score Less Than K",                  slug: "count-subarrays-with-score-less-than-k",                     topic: "Sliding Window", difficulty: "Hard" },
  { num: 2306,  name: "Naming a Company",                                        slug: "naming-a-company",                                           topic: "Hashing", difficulty: "Hard" },
  { num: 2312,  name: "Selling Pieces of Wood",                                  slug: "selling-pieces-of-wood",                                     topic: "DP", difficulty: "Hard" },
  { num: 2318,  name: "Number of Distinct Roll Sequences",                       slug: "number-of-distinct-roll-sequences",                          topic: "DP", difficulty: "Hard" },
  { num: 2321,  name: "Maximum Score Of Spliced Array",                          slug: "maximum-score-of-spliced-array",                             topic: "DP", difficulty: "Hard" },
  { num: 2322,  name: "Minimum Score After Removals on a Tree",                  slug: "minimum-score-after-removals-on-a-tree",                     topic: "Tree", difficulty: "Hard" },
  { num: 2328,  name: "Number of Increasing Paths in a Grid",                    slug: "number-of-increasing-paths-in-a-grid",                       topic: "DP", difficulty: "Hard" },
  { num: 2334,  name: "Subarray With Elements Greater Than Varying Threshold",   slug: "subarray-with-elements-greater-than-varying-threshold",      topic: "Stack", difficulty: "Hard" },
  { num: 2338,  name: "Count the Number of Ideal Arrays",                        slug: "count-the-number-of-ideal-arrays",                           topic: "Math", difficulty: "Hard" },
  { num: 2350,  name: "Shortest Impossible Sequence of Rolls",                   slug: "shortest-impossible-sequence-of-rolls",                      topic: "Greedy", difficulty: "Medium" },
  { num: 2354,  name: "Number of Excellent Pairs",                               slug: "number-of-excellent-pairs",                                  topic: "Bit Manipulation", difficulty: "Hard" },
  { num: 2359,  name: "Find Closest Node to Given Two Nodes",                    slug: "find-closest-node-to-given-two-nodes",                       topic: "Graph", difficulty: "Medium" },
  { num: 2376,  name: "Count Special Integers",                                  slug: "count-special-integers",                                     topic: "Digit DP", difficulty: "Hard" },
  { num: 2381,  name: "Shifting Letters II",                                     slug: "shifting-letters-ii",                                        topic: "Segment Tree", difficulty: "Medium" },
  { num: 2382,  name: "Maximum Segment Sum After Removals",                      slug: "maximum-segment-sum-after-removals",                         topic: "DSU", difficulty: "Hard" },
  { num: 2386,  name: "Find the K-Sum of an Array",                              slug: "find-the-k-sum-of-an-array",                                 topic: "Heap", difficulty: "Hard" },
  { num: 2392,  name: "Build a Matrix With Conditions",                          slug: "build-a-matrix-with-conditions",                             topic: "Graph", difficulty: "Hard" },
  { num: 2398,  name: "Maximum Number of Robots Within Budget",                  slug: "maximum-number-of-robots-within-budget",                     topic: "Sliding Window", difficulty: "Hard" },
  { num: 2407,  name: "Longest Increasing Subsequence II",                       slug: "longest-increasing-subsequence-ii",                          topic: "Segment Tree", difficulty: "Hard" },
  { num: 2416,  name: "Sum of Prefix Scores of Strings",                         slug: "sum-of-prefix-scores-of-strings",                            topic: "Trie", difficulty: "Hard" },
  { num: 2421,  name: "Number of Good Paths",                                    slug: "number-of-good-paths",                                       topic: "DSU", difficulty: "Hard" },
  { num: 2426,  name: "Number of Pairs Satisfying Inequality",                   slug: "number-of-pairs-satisfying-inequality",                      topic: "BIT", difficulty: "Hard" },
  { num: 2430,  name: "Maximum Deletions on a String",                           slug: "maximum-deletions-on-a-string",                              topic: "DP", difficulty: "Hard" },
  { num: 2435,  name: "Paths in Matrix Whose Sum Is Divisible by K",             slug: "paths-in-matrix-whose-sum-is-divisible-by-k",               topic: "DP", difficulty: "Hard" },
  { num: 2439,  name: "Minimize Maximum of Array",                               slug: "minimize-maximum-of-array",                                  topic: "Binary Search", difficulty: "Medium" },
  { num: 2440,  name: "Create Components With Same Value",                       slug: "create-components-with-same-value",                          topic: "Tree", difficulty: "Medium" },
  { num: 2444,  name: "Count Subarrays With Fixed Bounds",                       slug: "count-subarrays-with-fixed-bounds",                          topic: "Sliding Window", difficulty: "Hard" },
  { num: 2448,  name: "Minimum Cost to Make Array Equal",                        slug: "minimum-cost-to-make-array-equal",                           topic: "Binary Search", difficulty: "Medium" },
  { num: 2449,  name: "Minimum Number of Operations to Make Arrays Similar",     slug: "minimum-number-of-operations-to-make-arrays-similar",       topic: "Greedy", difficulty: "Hard" },
  { num: 2454,  name: "Next Greater Element IV",                                 slug: "next-greater-element-iv",                                    topic: "Stack", difficulty: "Hard" },
  { num: 2458,  name: "Height of Binary Tree After Subtree Removal Queries",     slug: "height-of-binary-tree-after-subtree-removal-queries",        topic: "Tree", difficulty: "Hard" },
  { num: 2463,  name: "Minimum Total Distance Traveled",                         slug: "minimum-total-distance-traveled",                            topic: "DP", difficulty: "Hard" },
  { num: 2467,  name: "Most Profitable Path in a Tree",                          slug: "most-profitable-path-in-a-tree",                             topic: "Tree", difficulty: "Medium" },
  { num: 2468,  name: "Split Message Based on Limit",                            slug: "split-message-based-on-limit",                               topic: "Binary Search", difficulty: "Hard" },
  { num: 2472,  name: "Maximum Number of Non-overlapping Palindrome Substrings", slug: "maximum-number-of-non-overlapping-palindrome-substrings",    topic: "DP", difficulty: "Hard" },
  { num: 2478,  name: "Number of Beautiful Partitions",                          slug: "number-of-beautiful-partitions",                             topic: "DP", difficulty: "Hard" },
  { num: 2484,  name: "Count Palindromic Subsequences",                          slug: "count-palindromic-subsequences",                             topic: "DP", difficulty: "Hard" },
  { num: 2488,  name: "Count Subarrays With Median K",                           slug: "count-subarrays-with-median-k",                              topic: "Hashing", difficulty: "Hard" },
  { num: 2493,  name: "Divide Nodes Into the Maximum Number of Groups",          slug: "divide-nodes-into-the-maximum-number-of-groups",             topic: "Graph", difficulty: "Hard" },
  { num: 2499,  name: "Minimum Total Cost to Make Arrays Unequal",              slug: "minimum-total-cost-to-make-arrays-unequal",                  topic: "Greedy", difficulty: "Hard" },
  { num: 2502,  name: "Design Memory Allocator",                                 slug: "design-memory-allocator",                                    topic: "Design", difficulty: "Medium" },
  { num: 2503,  name: "Maximum Number of Points From Grid Queries",              slug: "maximum-number-of-points-from-grid-queries",                 topic: "BFS", difficulty: "Hard" },
  { num: 2508,  name: "Add Edges to Make Degrees of All Nodes Even",             slug: "add-edges-to-make-degrees-of-all-nodes-even",                topic: "Graph", difficulty: "Hard" },
  { num: 2509,  name: "Cycle Length Queries in a Tree",                          slug: "cycle-length-queries-in-a-tree",                             topic: "Tree", difficulty: "Hard" },
  { num: 2513,  name: "Minimize the Maximum of Two Arrays",                      slug: "minimize-the-maximum-of-two-arrays",                         topic: "Binary Search", difficulty: "Medium" },
  { num: 2514,  name: "Count Anagrams",                                          slug: "count-anagrams",                                             topic: "Math", difficulty: "Hard" },
  { num: 2520,  name: "Number of Great Partitions",                              slug: "number-of-great-partitions",                                 topic: "Math", difficulty: "Hard" },
  { num: 2528,  name: "Maximize the Minimum Powered City",                       slug: "maximize-the-minimum-powered-city",                          topic: "Binary Search", difficulty: "Hard" },
  { num: 2532,  name: "Time to Cross a Bridge",                                  slug: "time-to-cross-a-bridge",                                     topic: "Heap", difficulty: "Hard" },
  { num: 2537,  name: "Count the Number of Good Subarrays",                      slug: "count-the-number-of-good-subarrays",                         topic: "Sliding Window", difficulty: "Hard" },
  { num: 2538,  name: "Difference Between Maximum and Minimum Price Sum",        slug: "difference-between-maximum-and-minimum-price-sum",           topic: "Tree", difficulty: "Hard" },
  { num: 2542,  name: "Maximum Subsequence Score",                               slug: "maximum-subsequence-score",                                  topic: "Heap", difficulty: "Hard" },
  { num: 2543,  name: "Check if Point Is Reachable",                             slug: "check-if-point-is-reachable",                                topic: "Math", difficulty: "Medium" },
  { num: 2547,  name: "Minimum Cost to Split an Array",                          slug: "minimum-cost-to-split-an-array",                             topic: "DP", difficulty: "Hard" },
  { num: 2551,  name: "Put Marbles in Bags",                                     slug: "put-marbles-in-bags",                                        topic: "Greedy", difficulty: "Hard" },
  { num: 2552,  name: "Count Increasing Quadruplets",                            slug: "count-increasing-quadruplets",                               topic: "DP", difficulty: "Hard" },
  { num: 2555,  name: "Maximize Win From Two Segments",                          slug: "maximize-win-from-two-segments",                             topic: "Sliding Window", difficulty: "Hard" },
  { num: 2561,  name: "Rearranging Fruits",                                      slug: "rearranging-fruits",                                         topic: "Greedy", difficulty: "Hard" },
  { num: 2565,  name: "Subsequence With the Minimum Score",                      slug: "subsequence-with-the-minimum-score",                         topic: "Binary Search", difficulty: "Hard" },
  { num: 2572,  name: "Count the Number of Square-Free Subsets",                 slug: "count-the-number-of-square-free-subsets",                    topic: "Bitmask DP", difficulty: "Medium" },
  { num: 2573,  name: "Find the String with LCP",                                slug: "find-the-string-with-lcp",                                   topic: "String", difficulty: "Hard" },
  { num: 2577,  name: "Minimum Time to Visit a Cell In a Grid",                  slug: "minimum-time-to-visit-a-cell-in-a-grid",                     topic: "BFS", difficulty: "Hard" },
  { num: 2581,  name: "Count Number of Possible Root Nodes",                     slug: "count-number-of-possible-root-nodes",                        topic: "Tree", difficulty: "Hard" },
  { num: 2584,  name: "Split the Array to Make Coprime Products",                slug: "split-the-array-to-make-coprime-products",                   topic: "Math", difficulty: "Medium" },
  { num: 2585,  name: "Number of Ways to Earn Points",                           slug: "number-of-ways-to-earn-points",                              topic: "DP", difficulty: "Hard" },
  { num: 2588,  name: "Count the Number of Beautiful Subarrays",                 slug: "count-the-number-of-beautiful-subarrays",                    topic: "Bit Manipulation", difficulty: "Hard" },
  { num: 2589,  name: "Minimum Time to Complete All Tasks",                      slug: "minimum-time-to-complete-all-tasks",                         topic: "Greedy", difficulty: "Hard" },
  { num: 2597,  name: "The Number of Beautiful Subsets",                         slug: "the-number-of-beautiful-subsets",                            topic: "DP", difficulty: "Medium" },
  { num: 2598,  name: "Smallest Missing Non-negative Integer After Operations",  slug: "smallest-missing-non-negative-integer-after-operations",     topic: "Math", difficulty: "Hard" },
  { num: 2603,  name: "Collect Coins in a Tree",                                 slug: "collect-coins-in-a-tree",                                    topic: "Tree", difficulty: "Hard" },
  { num: 2607,  name: "Make K-Subarray Sums Equal",                              slug: "make-k-subarray-sums-equal",                                 topic: "Math", difficulty: "Hard" },
  { num: 2612,  name: "Minimum Reverse Operations",                              slug: "minimum-reverse-operations",                                 topic: "BFS", difficulty: "Hard" },
  { num: 2617,  name: "Minimum Number of Visited Cells in a Grid",               slug: "minimum-number-of-visited-cells-in-a-grid",                  topic: "BFS", difficulty: "Hard" },
  { num: 2641,  name: "Cousins in Binary Tree II",                               slug: "cousins-in-binary-tree-ii",                                  topic: "Tree", difficulty: "Hard" },
  { num: 2642,  name: "Design Graph With Shortest Path Calculator",              slug: "design-graph-with-shortest-path-calculator",                 topic: "Graph", difficulty: "Hard" },
  { num: 2646,  name: "Minimize the Total Price of the Trips",                   slug: "minimize-the-total-price-of-the-trips",                      topic: "Tree", difficulty: "Hard" },
  { num: 2653,  name: "Sliding Subarray Beauty",                                 slug: "sliding-subarray-beauty",                                    topic: "Sliding Window", difficulty: "Hard" },
  { num: 2654,  name: "Minimum Number of Operations to Make All Array Elements Equal to 1", slug: "minimum-number-of-operations-to-make-all-array-elements-equal-to-1", topic: "Math", difficulty: "Hard" },
  { num: 2659,  name: "Make Array Empty",                                        slug: "make-array-empty",                                           topic: "Segment Tree", difficulty: "Hard" },
  { num: 2663,  name: "Lexicographically Smallest Beautiful String",             slug: "lexicographically-smallest-beautiful-string",                topic: "Greedy", difficulty: "Hard" },
  { num: 2672,  name: "Number of Adjacent Elements With the Same Color",         slug: "number-of-adjacent-elements-with-the-same-color",            topic: "Array", difficulty: "Hard" },
  { num: 2673,  name: "Make Costs of Paths Equal in a Binary Tree",              slug: "make-costs-of-paths-equal-in-a-binary-tree",                 topic: "Tree", difficulty: "Hard" },
  { num: 2680,  name: "Maximum OR",                                              slug: "maximum-or",                                                 topic: "Greedy", difficulty: "Hard" },
  { num: 2681,  name: "Power of Heroes",                                         slug: "power-of-heroes",                                            topic: "Math", difficulty: "Hard" },
  { num: 2699,  name: "Modify Graph Edge Weights",                               slug: "modify-graph-edge-weights",                                  topic: "Graph", difficulty: "Hard" },
  { num: 2709,  name: "Greatest Common Divisor Traversal",                       slug: "greatest-common-divisor-traversal",                          topic: "DSU", difficulty: "Hard" },
  { num: 2713,  name: "Maximum Strictly Increasing Cells in a Matrix",           slug: "maximum-strictly-increasing-cells-in-a-matrix",              topic: "DP", difficulty: "Hard" },
  { num: 2718,  name: "Sum of Matrix After Queries",                             slug: "sum-of-matrix-after-queries",                                topic: "Hashing", difficulty: "Hard" },
  { num: 2719,  name: "Count of Integers",                                       slug: "count-of-integers",                                          topic: "Digit DP", difficulty: "Hard" },
  { num: 2731,  name: "Movement of Robots",                                      slug: "movement-of-robots",                                         topic: "Math", difficulty: "Hard" },
  { num: 2732,  name: "Find a Good Subset of the Matrix",                        slug: "find-a-good-subset-of-the-matrix",                           topic: "Greedy", difficulty: "Hard" },
  { num: 2735,  name: "Collecting Chocolates",                                   slug: "collecting-chocolates",                                      topic: "Math", difficulty: "Hard" },
  { num: 2736,  name: "Maximum Sum Queries",                                     slug: "maximum-sum-queries",                                        topic: "Segment Tree", difficulty: "Hard" },
  { num: 2741,  name: "Special Permutations",                                    slug: "special-permutations",                                       topic: "Bitmask DP", difficulty: "Hard" },
  { num: 2749,  name: "Minimum Operations to Make the Integer Zero",             slug: "minimum-operations-to-make-the-integer-zero",                topic: "Bit Manipulation", difficulty: "Hard" },
  { num: 2750,  name: "Ways to Split Array Into Good Subarrays",                 slug: "ways-to-split-array-into-good-subarrays",                    topic: "Math", difficulty: "Hard" },
  { num: 2751,  name: "Robot Collisions",                                        slug: "robot-collisions",                                           topic: "Stack", difficulty: "Hard" },
  { num: 2762,  name: "Continuous Subarrays",                                    slug: "continuous-subarrays",                                       topic: "Sliding Window", difficulty: "Hard" },
  { num: 2763,  name: "Sum of Imbalance Numbers of All Subarrays",               slug: "sum-of-imbalance-numbers-of-all-subarrays",                  topic: "Array", difficulty: "Hard" },
  { num: 2768,  name: "Number of Black Blocks",                                  slug: "number-of-black-blocks",                                     topic: "Hashing", difficulty: "Hard" },
  { num: 2771,  name: "Longest Non-decreasing Subarray From Two Arrays",         slug: "longest-non-decreasing-subarray-from-two-arrays",            topic: "DP", difficulty: "Hard" },
  { num: 2772,  name: "Apply Operations to Make All Array Elements Equal to Zero", slug: "apply-operations-to-make-all-array-elements-equal-to-zero", topic: "Greedy", difficulty: "Hard" },
  { num: 2781,  name: "Length of the Longest Valid Substring",                   slug: "length-of-the-longest-valid-substring",                      topic: "Sliding Window", difficulty: "Hard" },
  { num: 2786,  name: "Visit Array Positions to Maximize Score",                 slug: "visit-array-positions-to-maximize-score",                    topic: "DP", difficulty: "Hard" },
  { num: 2787,  name: "Ways to Express an Integer as Sum of Powers",             slug: "ways-to-express-an-integer-as-sum-of-powers",                topic: "DP", difficulty: "Hard" },
  { num: 2791,  name: "Count Paths That Can Form a Palindrome in a Tree",        slug: "count-paths-that-can-form-a-palindrome-in-a-tree",           topic: "Tree", difficulty: "Hard" },
  { num: 2800,  name: "Shortest String That Contains Three Strings",             slug: "shortest-string-that-contains-three-strings",                topic: "String", difficulty: "Hard" },
  { num: 2801,  name: "Count Stepping Numbers in Range",                         slug: "count-stepping-numbers-in-range",                            topic: "Digit DP", difficulty: "Hard" },
  { num: 2808,  name: "Minimum Seconds to Equalize a Circular Array",            slug: "minimum-seconds-to-equalize-a-circular-array",               topic: "Hashing", difficulty: "Hard" },
  { num: 2809,  name: "Minimum Time to Make Array Sum At Most x",                slug: "minimum-time-to-make-array-sum-at-most-x",                   topic: "DP", difficulty: "Hard" },
  { num: 2812,  name: "Find the Safest Path in a Grid",                          slug: "find-the-safest-path-in-a-grid",                             topic: "BFS", difficulty: "Hard" },
  { num: 2818,  name: "Apply Operations to Maximize Score",                      slug: "apply-operations-to-maximize-score",                         topic: "Stack", difficulty: "Hard" },
  { num: 2826,  name: "Sorting Three Groups",                                    slug: "sorting-three-groups",                                       topic: "DP", difficulty: "Hard" },
  { num: 2827,  name: "Number of Beautiful Integers in the Range",               slug: "number-of-beautiful-integers-in-the-range",                  topic: "Digit DP", difficulty: "Hard" },
  { num: 2830,  name: "Maximize the Profit as the Salesman",                     slug: "maximize-the-profit-as-the-salesman",                        topic: "DP", difficulty: "Hard" },
  { num: 2831,  name: "Find the Longest Equal Subarray",                         slug: "find-the-longest-equal-subarray",                            topic: "Sliding Window", difficulty: "Hard" },
  { num: 2835,  name: "Minimum Operations to Form Subsequence With Target Sum",  slug: "minimum-operations-to-form-subsequence-with-target-sum",     topic: "Greedy", difficulty: "Hard" },
  { num: 2836,  name: "Maximize Value of Function in a Ball Passing Game",       slug: "maximize-value-of-function-in-a-ball-passing-game",          topic: "Binary Lifting", difficulty: "Hard" },
  { num: 2841,  name: "Maximum Sum of Almost Unique Subarray",                   slug: "maximum-sum-of-almost-unique-subarray",                      topic: "Sliding Window", difficulty: "Hard" },
  { num: 2842,  name: "Count K-Subsequences of a String With Maximum Beauty",    slug: "count-k-subsequences-of-a-string-with-maximum-beauty",       topic: "Greedy", difficulty: "Hard" },
  { num: 2845,  name: "Count of Interesting Subarrays",                          slug: "count-of-interesting-subarrays",                             topic: "Hashing", difficulty: "Hard" },
  { num: 2846,  name: "Minimum Edge Weight Equilibrium Queries in a Tree",       slug: "minimum-edge-weight-equilibrium-queries-in-a-tree",          topic: "Tree", difficulty: "Hard" },
  { num: 2850,  name: "Minimum Moves to Spread Stones Over Grid",                slug: "minimum-moves-to-spread-stones-over-grid",                   topic: "BFS", difficulty: "Hard" },
  { num: 2851,  name: "String Transformation",                                   slug: "string-transformation",                                      topic: "String", difficulty: "Hard" },
  { num: 2856,  name: "Minimum Array Length After Pair Removals",                slug: "minimum-array-length-after-pair-removals",                   topic: "Binary Search", difficulty: "Hard" },
  { num: 2857,  name: "Count Pairs of Points With Distance k",                   slug: "count-pairs-of-points-with-distance-k",                      topic: "Hashing", difficulty: "Hard" },
  { num: 2858,  name: "Minimum Edge Reversals So Every Node Is Reachable",       slug: "minimum-edge-reversals-so-every-node-is-reachable",          topic: "Tree", difficulty: "Hard" },
  { num: 2861,  name: "Maximum Number of Alloys",                                slug: "maximum-number-of-alloys",                                   topic: "Binary Search", difficulty: "Hard" },
  { num: 2862,  name: "Maximum Element-Sum of a Complete Subset of Indices",     slug: "maximum-element-sum-of-a-complete-subset-of-indices",        topic: "Math", difficulty: "Hard" },
  { num: 2865,  name: "Beautiful Towers I",                                      slug: "beautiful-towers-i",                                         topic: "Stack", difficulty: "Hard" },
  { num: 2866,  name: "Beautiful Towers II",                                     slug: "beautiful-towers-ii",                                        topic: "Stack", difficulty: "Hard" },
  { num: 2867,  name: "Count Valid Paths in a Tree",                             slug: "count-valid-paths-in-a-tree",                                topic: "Tree", difficulty: "Hard" },
  { num: 2871,  name: "Split Array Into Maximum Number of Subarrays",            slug: "split-array-into-maximum-number-of-subarrays",               topic: "Greedy", difficulty: "Hard" },
  { num: 2872,  name: "Maximum Number of K-Divisible Components",               slug: "maximum-number-of-k-divisible-components",                   topic: "Tree", difficulty: "Hard" },
  { num: 2875,  name: "Minimum Size Subarray in Infinite Array",                 slug: "minimum-size-subarray-in-infinite-array",                    topic: "Sliding Window", difficulty: "Hard" },
  { num: 2876,  name: "Count Visited Nodes in a Directed Graph",                 slug: "count-visited-nodes-in-a-directed-graph",                    topic: "Graph", difficulty: "Hard" },
  { num: 2896,  name: "Apply Operations to Make Two Strings Equal",              slug: "apply-operations-to-make-two-strings-equal",                 topic: "DP", difficulty: "Hard" },
  { num: 2897,  name: "Apply Operations on Array to Maximize Sum of Squares",    slug: "apply-operations-on-array-to-maximize-sum-of-squares",       topic: "Greedy", difficulty: "Hard" },
  { num: 2901,  name: "Longest Unequal Adjacent Groups Subsequence II",          slug: "longest-unequal-adjacent-groups-subsequence-ii",             topic: "DP", difficulty: "Hard" },
  { num: 2902,  name: "Count of Sub-Multisets With Bounded Sum",                 slug: "count-of-sub-multisets-with-bounded-sum",                    topic: "DP", difficulty: "Hard" },
  { num: 2910,  name: "Minimum Number of Groups to Create a Valid Assignment",   slug: "minimum-number-of-groups-to-create-a-valid-assignment",      topic: "Greedy", difficulty: "Hard" },
  { num: 2911,  name: "Minimum Changes to Make K Semi-palindromes",              slug: "minimum-changes-to-make-k-semi-palindromes",                 topic: "DP", difficulty: "Hard" },
  { num: 2916,  name: "Subarrays Distinct Element Sum of Squares II",            slug: "subarrays-distinct-element-sum-of-squares-ii",               topic: "Segment Tree", difficulty: "Hard" },
  { num: 2919,  name: "Minimum Increment Operations to Make Array Beautiful",    slug: "minimum-increment-operations-to-make-array-beautiful",       topic: "DP", difficulty: "Hard" },
  { num: 2920,  name: "Maximum Points After Collecting Coins From All Nodes",    slug: "maximum-points-after-collecting-coins-from-all-nodes",       topic: "Tree", difficulty: "Hard" },
  { num: 2925,  name: "Maximum Score After Applying Operations on a Tree",       slug: "maximum-score-after-applying-operations-on-a-tree",          topic: "Tree", difficulty: "Hard" },
  { num: 2926,  name: "Maximum Balanced Subsequence Sum",                        slug: "maximum-balanced-subsequence-sum",                           topic: "Segment Tree", difficulty: "Hard" },
  { num: 2930,  name: "Number of Strings Which Can Be Rearranged to Contain Substring", slug: "number-of-strings-which-can-be-rearranged-to-contain-substring", topic: "DP", difficulty: "Hard" },
  { num: 2935,  name: "Maximum Strong Pair XOR II",                              slug: "maximum-strong-pair-xor-ii",                                 topic: "Trie", difficulty: "Hard" },
  { num: 2939,  name: "Maximum Xor Product",                                     slug: "maximum-xor-product",                                        topic: "Bit Manipulation", difficulty: "Hard" },
  { num: 2940,  name: "Find Building Where Alice and Bob Can Meet",              slug: "find-building-where-alice-and-bob-can-meet",                 topic: "Segment Tree", difficulty: "Hard" },
  { num: 2945,  name: "Find Maximum Non-decreasing Array Length",                slug: "find-maximum-non-decreasing-array-length",                   topic: "DP", difficulty: "Hard" },
  { num: 2948,  name: "Make Lexicographically Smallest Array by Swapping Elements", slug: "make-lexicographically-smallest-array-by-swapping-elements", topic: "Greedy", difficulty: "Hard" },
  { num: 2949,  name: "Count Beautiful Substrings II",                           slug: "count-beautiful-substrings-ii",                              topic: "Hashing", difficulty: "Hard" },
  { num: 2968,  name: "Apply Operations to Maximize Frequency Score",            slug: "apply-operations-to-maximize-frequency-score",               topic: "Sliding Window", difficulty: "Hard" },
  { num: 2972,  name: "Count the Number of Incremovable Subarrays II",           slug: "count-the-number-of-incremovable-subarrays-ii",              topic: "Binary Search", difficulty: "Hard" },
  { num: 2973,  name: "Find Number of Coins to Place in Tree Nodes",             slug: "find-number-of-coins-to-place-in-tree-nodes",                topic: "Tree", difficulty: "Hard" },
  { num: 2976,  name: "Minimum Cost to Convert String I",                        slug: "minimum-cost-to-convert-string-i",                           topic: "Graph", difficulty: "Hard" },
  { num: 2977,  name: "Minimum Cost to Convert String II",                       slug: "minimum-cost-to-convert-string-ii",                          topic: "Graph", difficulty: "Hard" },
  { num: 2982,  name: "Find Longest Special Substring That Occurs Thrice II",    slug: "find-longest-special-substring-that-occurs-thrice-ii",       topic: "Binary Search", difficulty: "Hard" },
  { num: 2983,  name: "Palindrome Rearrangement Queries",                        slug: "palindrome-rearrangement-queries",                            topic: "String", difficulty: "Hard" },
  { num: 3007,  name: "Maximum Number That Sum of the Prices Is Less Than or Equal to K", slug: "maximum-number-that-sum-of-the-prices-is-less-than-or-equal-to-k", topic: "Digit DP", difficulty: "Hard" },
  { num: 3008,  name: "Find Beautiful Indices in the Given Array II",            slug: "find-beautiful-indices-in-the-given-array-ii",               topic: "String", difficulty: "Hard" },
  { num: 3013,  name: "Divide an Array Into Subarrays With Minimum Cost II",     slug: "divide-an-array-into-subarrays-with-minimum-cost-ii",        topic: "Heap", difficulty: "Hard" },
  { num: 3017,  name: "Count the Number of Houses at a Certain Distance II",     slug: "count-the-number-of-houses-at-a-certain-distance-ii",        topic: "Graph", difficulty: "Hard" },
  { num: 3021,  name: "Alice and Bob Playing Flower Game",                       slug: "alice-and-bob-playing-flower-game",                          topic: "Math", difficulty: "Hard" },
  { num: 3022,  name: "Minimize OR of Remaining Elements Using Operations",      slug: "minimize-or-of-remaining-elements-using-operations",         topic: "Greedy", difficulty: "Hard" },
  { num: 3026,  name: "Maximum Good Subarray Sum",                               slug: "maximum-good-subarray-sum",                                  topic: "Hashing", difficulty: "Hard" },
  { num: 3027,  name: "Find the Number of Ways to Place People II",              slug: "find-the-number-of-ways-to-place-people-ii",                 topic: "BIT", difficulty: "Hard" },
  { num: 3031,  name: "Minimum Time to Revert Word to Initial State II",         slug: "minimum-time-to-revert-word-to-initial-state-ii",            topic: "String", difficulty: "Hard" },
  { num: 3035,  name: "Maximum Palindromes After Operations",                    slug: "maximum-palindromes-after-operations",                       topic: "String", difficulty: "Hard" },
  { num: 3036,  name: "Number of Subarrays That Match a Pattern II",             slug: "number-of-subarrays-that-match-a-pattern-ii",                topic: "String", difficulty: "Hard" },
  { num: 3040,  name: "Maximum Number of Operations With the Same Score II",     slug: "maximum-number-of-operations-with-the-same-score-ii",        topic: "DP", difficulty: "Hard" },
  { num: 3041,  name: "Maximize Consecutive Elements in an Array After Modification", slug: "maximize-consecutive-elements-in-an-array-after-modification", topic: "DP", difficulty: "Hard" },
  { num: 3045,  name: "Count Prefix and Suffix Pairs II",                        slug: "count-prefix-and-suffix-pairs-ii",                           topic: "Trie", difficulty: "Hard" },
  { num: 3048,  name: "Earliest Second to Mark Indices I",                       slug: "earliest-second-to-mark-indices-i",                          topic: "Binary Search", difficulty: "Hard" },
  { num: 3049,  name: "Earliest Second to Mark Indices II",                      slug: "earliest-second-to-mark-indices-ii",                         topic: "Segment Tree", difficulty: "Hard" },
  { num: 3068,  name: "Find the Maximum Sum of Node Values",                     slug: "find-the-maximum-sum-of-node-values",                        topic: "Tree", difficulty: "Hard" },
  { num: 3072,  name: "Distribute Elements Into Two Arrays II",                  slug: "distribute-elements-into-two-arrays-ii",                     topic: "Segment Tree", difficulty: "Hard" },
  { num: 3077,  name: "Maximum Strength of K Disjoint Subarrays",                slug: "maximum-strength-of-k-disjoint-subarrays",                   topic: "DP", difficulty: "Hard" },
  { num: 3082,  name: "Find the Sum of the Power of All Subsequences",           slug: "find-the-sum-of-the-power-of-all-subsequences",              topic: "DP", difficulty: "Hard" },
  { num: 3085,  name: "Minimum Deletions to Make String K-Special",              slug: "minimum-deletions-to-make-string-k-special",                 topic: "Greedy", difficulty: "Hard" },
  { num: 3086,  name: "Minimum Moves to Pick K Ones",                            slug: "minimum-moves-to-pick-k-ones",                               topic: "Greedy", difficulty: "Hard" },
  { num: 3093,  name: "Longest Common Suffix Queries",                           slug: "longest-common-suffix-queries",                              topic: "Trie", difficulty: "Hard" },
  { num: 3097,  name: "Shortest Subarray With OR at Least K II",                 slug: "shortest-subarray-with-or-at-least-k-ii",                    topic: "Sliding Window", difficulty: "Hard" },
  { num: 3098,  name: "Find the Sum of Subsequence Powers",                      slug: "find-the-sum-of-subsequence-powers",                         topic: "DP", difficulty: "Hard" },
  { num: 3102,  name: "Minimize Manhattan Distances",                            slug: "minimize-manhattan-distances",                                topic: "Math", difficulty: "Hard" },
  { num: 3108,  name: "Minimum Cost Walk in Weighted Graph",                     slug: "minimum-cost-walk-in-weighted-graph",                        topic: "DSU", difficulty: "Hard" },
  { num: 3113,  name: "Find the Number of Subarrays Where Boundary Elements Are Maximum", slug: "find-the-number-of-subarrays-where-boundary-elements-are-maximum", topic: "Stack", difficulty: "Hard" },
  { num: 3116,  name: "Kth Smallest Amount With Single Denomination Combination", slug: "kth-smallest-amount-with-single-denomination-combination",  topic: "Binary Search", difficulty: "Hard" },
  { num: 3117,  name: "Minimum Sum of Values by Dividing Array",                 slug: "minimum-sum-of-values-by-dividing-array",                    topic: "DP", difficulty: "Hard" },
  { num: 3122,  name: "Minimum Number of Operations to Satisfy Conditions",      slug: "minimum-number-of-operations-to-satisfy-conditions",         topic: "DP", difficulty: "Hard" },
  { num: 3123,  name: "Find Edges in Shortest Paths",                            slug: "find-edges-in-shortest-paths",                               topic: "Graph", difficulty: "Hard" },
  { num: 3139,  name: "Minimum Cost to Equalize Array",                          slug: "minimum-cost-to-equalize-array",                             topic: "Math", difficulty: "Hard" },
  { num: 3144,  name: "Minimum Substring Partition of Equal Character Frequency", slug: "minimum-substring-partition-of-equal-character-frequency", topic: "DP", difficulty: "Hard" },
  { num: 3145,  name: "Find Products of Elements of Big Array",                  slug: "find-products-of-elements-of-big-array",                     topic: "Binary Search", difficulty: "Hard" },
  { num: 3148,  name: "Maximum Difference Score in a Grid",                      slug: "maximum-difference-score-in-a-grid",                         topic: "DP", difficulty: "Hard" },
  { num: 3149,  name: "Find the Minimum Cost Array Permutation",                 slug: "find-the-minimum-cost-array-permutation",                    topic: "Bitmask DP", difficulty: "Hard" },
  { num: 3154,  name: "Find Number of Ways to Reach the K-th Stair",             slug: "find-number-of-ways-to-reach-the-k-th-stair",                topic: "DP", difficulty: "Hard" },
  { num: 3164,  name: "Find the Number of Good Pairs II",                        slug: "find-the-number-of-good-pairs-ii",                           topic: "Hashing", difficulty: "Hard" },
  { num: 3165,  name: "Maximum Sum of Subsequence With Non-adjacent Elements",   slug: "maximum-sum-of-subsequence-with-non-adjacent-elements",      topic: "Segment Tree", difficulty: "Hard" },
  { num: 3170,  name: "Lexicographically Minimum String After Removing Stars",   slug: "lexicographically-minimum-string-after-removing-stars",      topic: "Heap", difficulty: "Hard" },
  { num: 3171,  name: "Find Subarray With Bitwise AND Closest to K",             slug: "find-subarray-with-bitwise-and-closest-to-k",                topic: "Bit Manipulation", difficulty: "Hard" },
  { num: 3186,  name: "Maximum Total Damage With Spell Casting",                 slug: "maximum-total-damage-with-spell-casting",                    topic: "DP", difficulty: "Hard" },
  { num: 3187,  name: "Peaks in Array",                                          slug: "peaks-in-array",                                             topic: "Segment Tree", difficulty: "Hard" },
  { num: 3197,  name: "Find the Minimum Area to Cover All Ones II",              slug: "find-the-minimum-area-to-cover-all-ones-ii",                 topic: "Math", difficulty: "Hard" },
  { num: 3202,  name: "Find the Maximum Length of Valid Subsequence II",         slug: "find-the-maximum-length-of-valid-subsequence-ii",            topic: "DP", difficulty: "Hard" },
  { num: 3203,  name: "Find Minimum Diameter After Merging Two Trees",           slug: "find-minimum-diameter-after-merging-two-trees",              topic: "Tree", difficulty: "Hard" },
  { num: 3209,  name: "Number of Subarrays With AND Value of K",                 slug: "number-of-subarrays-with-and-value-of-k",                    topic: "Bit Manipulation", difficulty: "Hard" },
  { num: 3212,  name: "Count Submatrices With Equal Frequency of X and Y",      slug: "count-submatrices-with-equal-frequency-of-x-and-y",          topic: "Prefix Sum", difficulty: "Hard" },
  { num: 3213,  name: "Construct String with Minimum Cost",                      slug: "construct-string-with-minimum-cost",                         topic: "Trie", difficulty: "Hard" },
  { num: 3218,  name: "Minimum Cost for Cutting Cake I",                         slug: "minimum-cost-for-cutting-cake-i",                            topic: "Greedy", difficulty: "Hard" },
  { num: 3219,  name: "Minimum Cost for Cutting Cake II",                        slug: "minimum-cost-for-cutting-cake-ii",                           topic: "Greedy", difficulty: "Hard" },
  { num: 3225,  name: "Maximum Score From Grid Operations",                      slug: "maximum-score-from-grid-operations",                         topic: "DP", difficulty: "Hard" },
  { num: 3229,  name: "Minimum Operations to Make Array Equal to Target",        slug: "minimum-operations-to-make-array-equal-to-target",           topic: "Greedy", difficulty: "Hard" },
  { num: 3234,  name: "Count the Number of Substrings With Dominant Ones",       slug: "count-the-number-of-substrings-with-dominant-ones",          topic: "Sliding Window", difficulty: "Hard" },
  { num: 3235,  name: "Check if the Rectangle Corner Is Reachable",              slug: "check-if-the-rectangle-corner-is-reachable",                 topic: "Graph", difficulty: "Hard" },
  { num: 3244,  name: "Shortest Distance After Road Addition Queries II",         slug: "shortest-distance-after-road-addition-queries-ii",           topic: "Graph", difficulty: "Hard" },
  { num: 3245,  name: "Alternating Groups III",                                  slug: "alternating-groups-iii",                                     topic: "Segment Tree", difficulty: "Hard" },
  { num: 3250,  name: "Find the Count of Monotonic Pairs I",                     slug: "find-the-count-of-monotonic-pairs-i",                        topic: "DP", difficulty: "Hard" },
  { num: 3251,  name: "Find the Count of Monotonic Pairs II",                    slug: "find-the-count-of-monotonic-pairs-ii",                       topic: "DP", difficulty: "Hard" },
  { num: 3266,  name: "Final Array State After K Multiplication Operations II",  slug: "final-array-state-after-k-multiplication-operations-ii",     topic: "Heap", difficulty: "Hard" },
  { num: 3267,  name: "Count Almost Equal Pairs II",                             slug: "count-almost-equal-pairs-ii",                                topic: "Sorting", difficulty: "Hard" },
  { num: 3276,  name: "Select Cells in Grid With Maximum Score",                  slug: "select-cells-in-grid-with-maximum-score",                    topic: "Bitmask DP", difficulty: "Hard" },
  { num: 3277,  name: "Maximum XOR Score Subarray Queries",                      slug: "maximum-xor-score-subarray-queries",                         topic: "DP", difficulty: "Hard" },
  { num: 3283,  name: "Maximum Number of Moves to Kill All Pawns",               slug: "maximum-number-of-moves-to-kill-all-pawns",                  topic: "Bitmask DP", difficulty: "Hard" },
  { num: 3287,  name: "Find the Maximum Sequence Value of Array",                 slug: "find-the-maximum-sequence-value-of-array",                   topic: "Bit Manipulation", difficulty: "Hard" },
  { num: 3291,  name: "Minimum Number of Valid Strings to Form Target I",         slug: "minimum-number-of-valid-strings-to-form-target-i",           topic: "String", difficulty: "Hard" },
  { num: 3292,  name: "Minimum Number of Valid Strings to Form Target II",        slug: "minimum-number-of-valid-strings-to-form-target-ii",          topic: "String", difficulty: "Hard" },
  { num: 3297,  name: "Count Substrings That Can Be Rearranged to Contain a String I", slug: "count-substrings-that-can-be-rearranged-to-contain-a-string-i", topic: "Sliding Window", difficulty: "Hard" },
  { num: 3298,  name: "Count Substrings That Can Be Rearranged to Contain a String II", slug: "count-substrings-that-can-be-rearranged-to-contain-a-string-ii", topic: "Sliding Window", difficulty: "Hard" },
  { num: 10033, name: "Minimum Number of Operations to Make X and Y Equal",      slug: "minimum-number-of-operations-to-make-x-and-y-equal",         topic: "BFS", difficulty: "Hard" },
  { num: 10034, name: "Count the Number of Powerful Integers",                   slug: "count-the-number-of-powerful-integers",                      topic: "Digit DP", difficulty: "Hard" },
  { num: 10037, name: "Maximum Size of a Set After Removals",                    slug: "maximum-size-of-a-set-after-removals",                       topic: "Greedy", difficulty: "Hard" },
  { num: 10038, name: "Maximize the Number of Partitions After Operations",      slug: "maximize-the-number-of-partitions-after-operations",         topic: "Bitmask DP", difficulty: "Hard" },
  { num: 2192,  name: "All Ancestors of a Node in a Directed Acyclic Graph",     slug: "all-ancestors-of-a-node-in-a-directed-acyclic-graph",        topic: "Graph", difficulty: "Hard" },
  { num: 2385,  name: "Amount of Time for Binary Tree to Be Infected",           slug: "amount-of-time-for-binary-tree-to-be-infected",              topic: "Tree", difficulty: "Hard" },
  { num: 2471,  name: "Minimum Number of Operations to Sort a Binary Tree by Level", slug: "minimum-number-of-operations-to-sort-a-binary-tree-by-level", topic: "Tree", difficulty: "Hard" },
  { num: 2477,  name: "Minimum Fuel Cost to Report to the Capital",              slug: "minimum-fuel-cost-to-report-to-the-capital",                 topic: "Tree", difficulty: "Hard" },
  { num: 2368,  name: "Reachable Nodes With Restrictions",                       slug: "reachable-nodes-with-restrictions",                          topic: "Tree", difficulty: "Hard" },
  { num: 2316,  name: "Count Unreachable Pairs of Nodes in an Undirected Graph", slug: "count-unreachable-pairs-of-nodes-in-an-undirected-graph",    topic: "DSU", difficulty: "Hard" },
  { num: 2374,  name: "Node With Highest Edge Score",                            slug: "node-with-highest-edge-score",                               topic: "Graph", difficulty: "Hard" },
  { num: 2360,  name: "Longest Cycle in a Graph",                                slug: "longest-cycle-in-a-graph",                                   topic: "Graph", difficulty: "Hard" },
  { num: 2492,  name: "Minimum Score of a Path Between Two Cities",              slug: "minimum-score-of-a-path-between-two-cities",                 topic: "DSU", difficulty: "Hard" },
  { num: 2685,  name: "Count the Number of Complete Components",                 slug: "count-the-number-of-complete-components",                    topic: "DSU", difficulty: "Hard" },
  { num: 2101,  name: "Detonate the Maximum Bombs",                              slug: "detonate-the-maximum-bombs",                                 topic: "Graph", difficulty: "Hard" },
  // ── NEW problems from LeetCode list ──
  { num: 4,    name: "Median of Two Sorted Arrays",                              slug: "median-of-two-sorted-arrays",                                topic: "Binary Search", difficulty: "Hard" },
  { num: 10,   name: "Regular Expression Matching",                              slug: "regular-expression-matching",                                topic: "DP", difficulty: "Hard" },
  { num: 23,   name: "Merge k Sorted Lists",                                     slug: "merge-k-sorted-lists",                                       topic: "Heap", difficulty: "Hard" },
  { num: 25,   name: "Reverse Nodes in k-Group",                                 slug: "reverse-nodes-in-k-group",                                   topic: "Linked List", difficulty: "Hard" },
  { num: 30,   name: "Substring with Concatenation of All Words",                slug: "substring-with-concatenation-of-all-words",                  topic: "Sliding Window", difficulty: "Hard" },
  { num: 41,   name: "First Missing Positive",                                   slug: "first-missing-positive",                                     topic: "Array", difficulty: "Hard" },
  { num: 42,   name: "Trapping Rain Water",                                      slug: "trapping-rain-water",                                        topic: "Stack", difficulty: "Hard" },
  { num: 44,   name: "Wildcard Matching",                                        slug: "wildcard-matching",                                          topic: "DP", difficulty: "Hard" },
  { num: 60,   name: "Permutation Sequence",                                     slug: "permutation-sequence",                                       topic: "Math", difficulty: "Medium" },
  { num: 76,   name: "Minimum Window Substring",                                 slug: "minimum-window-substring",                                   topic: "Sliding Window", difficulty: "Hard" },
  { num: 84,   name: "Largest Rectangle in Histogram",                           slug: "largest-rectangle-in-histogram",                             topic: "Stack", difficulty: "Hard" },
  { num: 115,  name: "Distinct Subsequences",                                    slug: "distinct-subsequences",                                      topic: "DP", difficulty: "Hard" },
  { num: 123,  name: "Best Time to Buy and Sell Stock III",                      slug: "best-time-to-buy-and-sell-stock-iii",                        topic: "DP", difficulty: "Hard" },
  { num: 124,  name: "Binary Tree Maximum Path Sum",                             slug: "binary-tree-maximum-path-sum",                               topic: "Tree", difficulty: "Hard" },
  { num: 126,  name: "Word Ladder II",                                           slug: "word-ladder-ii",                                             topic: "BFS", difficulty: "Hard" },
  { num: 132,  name: "Palindrome Partitioning II",                               slug: "palindrome-partitioning-ii",                                 topic: "DP", difficulty: "Hard" },
  { num: 134,  name: "Gas Station",                                              slug: "gas-station",                                                topic: "Greedy", difficulty: "Medium" },
  { num: 135,  name: "Candy",                                                    slug: "candy",                                                      topic: "Greedy", difficulty: "Hard" },
  { num: 140,  name: "Word Break II",                                            slug: "word-break-ii",                                              topic: "DP", difficulty: "Hard" },
  { num: 149,  name: "Max Points on a Line",                                     slug: "max-points-on-a-line",                                       topic: "Math", difficulty: "Hard" },
  { num: 174,  name: "Dungeon Game",                                             slug: "dungeon-game",                                               topic: "DP", difficulty: "Hard" },
  { num: 188,  name: "Best Time to Buy and Sell Stock IV",                       slug: "best-time-to-buy-and-sell-stock-iv",                         topic: "DP", difficulty: "Hard" },
  { num: 214,  name: "Shortest Palindrome",                                      slug: "shortest-palindrome",                                        topic: "String", difficulty: "Hard" },
  { num: 239,  name: "Sliding Window Maximum",                                   slug: "sliding-window-maximum",                                     topic: "Sliding Window", difficulty: "Hard" },
  { num: 295,  name: "Find Median from Data Stream",                             slug: "find-median-from-data-stream",                               topic: "Heap", difficulty: "Hard" },
  { num: 312,  name: "Burst Balloons",                                           slug: "burst-balloons",                                             topic: "DP", difficulty: "Hard" },
  { num: 315,  name: "Count of Smaller Numbers After Self",                      slug: "count-of-smaller-numbers-after-self",                        topic: "Segment Tree", difficulty: "Hard" },
  { num: 327,  name: "Count of Range Sum",                                       slug: "count-of-range-sum",                                         topic: "Segment Tree", difficulty: "Hard" },
  { num: 329,  name: "Longest Increasing Path in a Matrix",                      slug: "longest-increasing-path-in-a-matrix",                        topic: "DP", difficulty: "Hard" },
  { num: 332,  name: "Reconstruct Itinerary",                                    slug: "reconstruct-itinerary",                                      topic: "Graph", difficulty: "Hard" },
  { num: 336,  name: "Palindrome Pairs",                                         slug: "palindrome-pairs",                                           topic: "Trie", difficulty: "Hard" },
  { num: 354,  name: "Russian Doll Envelopes",                                   slug: "russian-doll-envelopes",                                     topic: "DP", difficulty: "Hard" },
  { num: 363,  name: "Max Sum of Rectangle No Larger Than K",                    slug: "max-sum-of-rectangle-no-larger-than-k",                      topic: "Segment Tree", difficulty: "Hard" },
  { num: 403,  name: "Frog Jump",                                                slug: "frog-jump",                                                  topic: "DP", difficulty: "Hard" },
  { num: 410,  name: "Split Array Largest Sum",                                  slug: "split-array-largest-sum",                                    topic: "Binary Search", difficulty: "Hard" },
  { num: 446,  name: "Arithmetic Slices II - Subsequence",                       slug: "arithmetic-slices-ii-subsequence",                           topic: "DP", difficulty: "Hard" },
  { num: 466,  name: "Count The Repetitions",                                    slug: "count-the-repetitions",                                      topic: "String", difficulty: "Hard" },
  { num: 472,  name: "Concatenated Words",                                       slug: "concatenated-words",                                         topic: "Trie", difficulty: "Hard" },
  { num: 493,  name: "Reverse Pairs",                                            slug: "reverse-pairs",                                              topic: "Segment Tree", difficulty: "Hard" },
  { num: 502,  name: "IPO",                                                      slug: "ipo",                                                        topic: "Heap", difficulty: "Hard" },
  { num: 546,  name: "Remove Boxes",                                             slug: "remove-boxes",                                               topic: "DP", difficulty: "Hard" },
  { num: 552,  name: "Student Attendance Record II",                             slug: "student-attendance-record-ii",                               topic: "DP", difficulty: "Hard" },
  { num: 560,  name: "Subarray Sum Equals K",                                    slug: "subarray-sum-equals-k",                                      topic: "Hashing", difficulty: "Hard" },
  { num: 600,  name: "Non-negative Integers without Consecutive Ones",           slug: "non-negative-integers-without-consecutive-ones",             topic: "Digit DP", difficulty: "Hard" },
  { num: 629,  name: "K Inverse Pairs Array",                                    slug: "k-inverse-pairs-array",                                      topic: "DP", difficulty: "Hard" },
  { num: 630,  name: "Course Schedule III",                                      slug: "course-schedule-iii",                                        topic: "Greedy", difficulty: "Hard" },
  { num: 632,  name: "Smallest Range Covering Elements from K Lists",            slug: "smallest-range-covering-elements-from-k-lists",              topic: "Heap", difficulty: "Hard" },
  { num: 664,  name: "Strange Printer",                                          slug: "strange-printer",                                            topic: "DP", difficulty: "Hard" },
  { num: 675,  name: "Cut Off Trees for Golf Event",                             slug: "cut-off-trees-for-golf-event",                               topic: "BFS", difficulty: "Hard" },
  { num: 685,  name: "Redundant Connection II",                                  slug: "redundant-connection-ii",                                    topic: "DSU", difficulty: "Hard" },
  { num: 689,  name: "Maximum Sum of 3 Non-Overlapping Subarrays",               slug: "maximum-sum-of-3-non-overlapping-subarrays",                 topic: "DP", difficulty: "Hard" },
  { num: 719,  name: "Find K-th Smallest Pair Distance",                         slug: "find-k-th-smallest-pair-distance",                           topic: "Binary Search", difficulty: "Hard" },
  { num: 730,  name: "Count Different Palindromic Subsequences",                 slug: "count-different-palindromic-subsequences",                   topic: "DP", difficulty: "Hard" },
  { num: 732,  name: "My Calendar III",                                          slug: "my-calendar-iii",                                            topic: "Segment Tree", difficulty: "Hard" },
  { num: 741,  name: "Cherry Pickup",                                            slug: "cherry-pickup",                                              topic: "DP", difficulty: "Hard" },
  { num: 765,  name: "Couples Holding Hands",                                    slug: "couples-holding-hands",                                      topic: "DSU", difficulty: "Hard" },
  { num: 768,  name: "Max Chunks To Make Sorted II",                             slug: "max-chunks-to-make-sorted-ii",                               topic: "Stack", difficulty: "Hard" },
  { num: 769,  name: "Max Chunks To Make Sorted",                                slug: "max-chunks-to-make-sorted",                                  topic: "Stack", difficulty: "Hard" },
  { num: 773,  name: "Sliding Puzzle",                                           slug: "sliding-puzzle",                                             topic: "BFS", difficulty: "Hard" },
  { num: 778,  name: "Swim in Rising Water",                                     slug: "swim-in-rising-water",                                       topic: "BFS", difficulty: "Hard" },
  { num: 801,  name: "Minimum Swaps To Make Sequences Increasing",               slug: "minimum-swaps-to-make-sequences-increasing",                 topic: "DP", difficulty: "Hard" },
  { num: 805,  name: "Split Array With Same Average",                            slug: "split-array-with-same-average",                              topic: "Bitmask DP", difficulty: "Hard" },
  { num: 815,  name: "Bus Routes",                                               slug: "bus-routes",                                                 topic: "BFS", difficulty: "Hard" },
  { num: 818,  name: "Race Car",                                                 slug: "race-car",                                                   topic: "DP", difficulty: "Hard" },
  { num: 828,  name: "Count Unique Characters of All Substrings of a Given String", slug: "count-unique-characters-of-all-substrings-of-a-given-string", topic: "String", difficulty: "Hard" },
  { num: 834,  name: "Sum of Distances in Tree",                                 slug: "sum-of-distances-in-tree",                                   topic: "Tree", difficulty: "Hard" },
  { num: 847,  name: "Shortest Path Visiting All Nodes",                         slug: "shortest-path-visiting-all-nodes",                           topic: "BFS", difficulty: "Hard" },
  { num: 850,  name: "Rectangle Area II",                                        slug: "rectangle-area-ii",                                          topic: "Segment Tree", difficulty: "Hard" },
  { num: 857,  name: "Minimum Cost to Hire K Workers",                           slug: "minimum-cost-to-hire-k-workers",                             topic: "Heap", difficulty: "Hard" },
  { num: 862,  name: "Shortest Subarray with Sum at Least K",                    slug: "shortest-subarray-with-sum-at-least-k",                      topic: "Stack", difficulty: "Hard" },
  { num: 864,  name: "Shortest Path to Get All Keys",                            slug: "shortest-path-to-get-all-keys",                              topic: "BFS", difficulty: "Hard" },
  { num: 871,  name: "Minimum Number of Refueling Stops",                        slug: "minimum-number-of-refueling-stops",                          topic: "Heap", difficulty: "Hard" },
  { num: 879,  name: "Profitable Schemes",                                       slug: "profitable-schemes",                                         topic: "DP", difficulty: "Hard" },
  { num: 895,  name: "Maximum Frequency Stack",                                  slug: "maximum-frequency-stack",                                    topic: "Design", difficulty: "Hard" },
  { num: 899,  name: "Orderly Queue",                                            slug: "orderly-queue",                                              topic: "Math", difficulty: "Hard" },
  { num: 903,  name: "Valid Permutations for DI Sequence",                       slug: "valid-permutations-for-di-sequence",                         topic: "DP", difficulty: "Hard" },
  { num: 924,  name: "Minimize Malware Spread",                                  slug: "minimize-malware-spread",                                    topic: "DSU", difficulty: "Hard" },
  { num: 940,  name: "Distinct Subsequences II",                                 slug: "distinct-subsequences-ii",                                   topic: "DP", difficulty: "Hard" },
  { num: 950,  name: "Reveal Cards In Increasing Order",                         slug: "reveal-cards-in-increasing-order",                           topic: "Array", difficulty: "Hard" },
  { num: 952,  name: "Largest Component Size by Common Factor",                  slug: "largest-component-size-by-common-factor",                    topic: "DSU", difficulty: "Hard" },
  { num: 956,  name: "Tallest Billboard",                                        slug: "tallest-billboard",                                          topic: "DP", difficulty: "Hard" },
  { num: 960,  name: "Delete Columns to Make Sorted III",                        slug: "delete-columns-to-make-sorted-iii",                          topic: "DP", difficulty: "Hard" },
  { num: 975,  name: "Odd Even Jump",                                            slug: "odd-even-jump",                                              topic: "Stack", difficulty: "Hard" },
  { num: 980,  name: "Unique Paths III",                                         slug: "unique-paths-iii",                                           topic: "Bitmask DP", difficulty: "Hard" },
  { num: 987,  name: "Vertical Order Traversal of a Binary Tree",                slug: "vertical-order-traversal-of-a-binary-tree",                  topic: "Tree", difficulty: "Hard" },
  { num: 992,  name: "Subarrays with K Different Integers",                      slug: "subarrays-with-k-different-integers",                        topic: "Sliding Window", difficulty: "Hard" },
  { num: 995,  name: "Minimum Number of K Consecutive Bit Flips",               slug: "minimum-number-of-k-consecutive-bit-flips",                  topic: "Greedy", difficulty: "Hard" },
  { num: 996,  name: "Number of Squareful Arrays",                               slug: "number-of-squareful-arrays",                                 topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1000, name: "Minimum Cost to Merge Stones",                             slug: "minimum-cost-to-merge-stones",                               topic: "DP", difficulty: "Hard" },
  { num: 1031, name: "Maximum Sum of Two Non-Overlapping Subarrays",             slug: "maximum-sum-of-two-non-overlapping-subarrays",               topic: "Sliding Window", difficulty: "Hard" },
  { num: 1036, name: "Escape a Large Maze",                                      slug: "escape-a-large-maze",                                        topic: "BFS", difficulty: "Hard" },
  { num: 1044, name: "Longest Duplicate Substring",                              slug: "longest-duplicate-substring",                                topic: "Binary Search", difficulty: "Hard" },
  { num: 1074, name: "Number of Submatrices That Sum to Target",                 slug: "number-of-submatrices-that-sum-to-target",                   topic: "Prefix Sum", difficulty: "Hard" },
  { num: 1147, name: "Longest Chunked Palindrome Decomposition",                 slug: "longest-chunked-palindrome-decomposition",                   topic: "String", difficulty: "Hard" },
  { num: 1157, name: "Online Majority Element In Subarray",                      slug: "online-majority-element-in-subarray",                        topic: "Segment Tree", difficulty: "Hard" },
  { num: 1187, name: "Make Array Strictly Increasing",                           slug: "make-array-strictly-increasing",                             topic: "DP", difficulty: "Hard" },
  { num: 1192, name: "Critical Connections in a Network",                        slug: "critical-connections-in-a-network",                          topic: "Graph", difficulty: "Hard" },
  { num: 1203, name: "Sort Items by Groups Respecting Dependencies",             slug: "sort-items-by-groups-respecting-dependencies",               topic: "Graph", difficulty: "Hard" },
  { num: 1220, name: "Count Vowels Permutation",                                 slug: "count-vowels-permutation",                                   topic: "DP", difficulty: "Hard" },
  { num: 1223, name: "Dice Roll Simulation",                                     slug: "dice-roll-simulation",                                       topic: "DP", difficulty: "Hard" },
  { num: 1235, name: "Maximum Profit in Job Scheduling",                         slug: "maximum-profit-in-job-scheduling",                           topic: "DP", difficulty: "Hard" },
  { num: 1255, name: "Maximum Score Words Formed by Letters",                    slug: "maximum-score-words-formed-by-letters",                      topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1263, name: "Minimum Moves to Move a Box to Their Target Location",     slug: "minimum-moves-to-move-a-box-to-their-target-location",       topic: "BFS", difficulty: "Hard" },
  { num: 1269, name: "Number of Ways to Stay in the Same Place After Some Steps",slug: "number-of-ways-to-stay-in-the-same-place-after-some-steps",  topic: "DP", difficulty: "Hard" },
  { num: 1278, name: "Palindrome Partitioning III",                              slug: "palindrome-partitioning-iii",                                topic: "DP", difficulty: "Hard" },
  { num: 1293, name: "Shortest Path in a Grid with Obstacles Elimination",      slug: "shortest-path-in-a-grid-with-obstacles-elimination",         topic: "BFS", difficulty: "Hard" },
  { num: 1301, name: "Number of Paths with Max Score",                           slug: "number-of-paths-with-max-score",                             topic: "DP", difficulty: "Hard" },
  { num: 1312, name: "Minimum Insertion Steps to Make a String Palindrome",      slug: "minimum-insertion-steps-to-make-a-string-palindrome",        topic: "DP", difficulty: "Hard" },
  { num: 1316, name: "Distinct Echo Substrings",                                 slug: "distinct-echo-substrings",                                   topic: "String", difficulty: "Hard" },
  { num: 1320, name: "Minimum Distance to Type a Word Using Two Fingers",        slug: "minimum-distance-to-type-a-word-using-two-fingers",          topic: "DP", difficulty: "Hard" },
  { num: 1326, name: "Minimum Number of Taps to Open to Water a Garden",        slug: "minimum-number-of-taps-to-open-to-water-a-garden",           topic: "Greedy", difficulty: "Hard" },
  { num: 1329, name: "Sort the Matrix Diagonally",                               slug: "sort-the-matrix-diagonally",                                 topic: "Sorting", difficulty: "Hard" },
  { num: 1340, name: "Jump Game V",                                              slug: "jump-game-v",                                                topic: "DP", difficulty: "Hard" },
  { num: 1345, name: "Jump Game IV",                                             slug: "jump-game-iv",                                               topic: "BFS", difficulty: "Hard" },
  { num: 1349, name: "Maximum Students Taking Exam",                             slug: "maximum-students-taking-exam",                               topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1368, name: "Minimum Cost to Make at Least One Valid Path in a Grid",   slug: "minimum-cost-to-make-at-least-one-valid-path-in-a-grid",     topic: "BFS", difficulty: "Hard" },
  { num: 1373, name: "Maximum Sum BST in Binary Tree",                           slug: "maximum-sum-bst-in-binary-tree",                             topic: "Tree", difficulty: "Hard" },
  { num: 1377, name: "Frog Position After T Seconds",                            slug: "frog-position-after-t-seconds",                              topic: "BFS", difficulty: "Hard" },
  { num: 1383, name: "Maximum Performance of a Team",                            slug: "maximum-performance-of-a-team",                              topic: "Heap", difficulty: "Hard" },
  { num: 1388, name: "Pizza With 3n Slices",                                     slug: "pizza-with-3n-slices",                                       topic: "DP", difficulty: "Hard" },
  { num: 1397, name: "Find All Good Strings",                                    slug: "find-all-good-strings",                                      topic: "DP", difficulty: "Hard" },
  { num: 1406, name: "Stone Game III",                                           slug: "stone-game-iii",                                             topic: "DP", difficulty: "Hard" },
  { num: 1411, name: "Number of Ways to Paint N × 3 Grid",                       slug: "number-of-ways-to-paint-n-3-grid",                           topic: "DP", difficulty: "Hard" },
  { num: 1420, name: "Build Array Where You Can Find The Maximum Exactly K Comparisons", slug: "build-array-where-you-can-find-the-maximum-exactly-k-comparisons", topic: "DP", difficulty: "Hard" },
  { num: 1424, name: "Diagonal Traverse II",                                     slug: "diagonal-traverse-ii",                                       topic: "Array", difficulty: "Hard" },
  { num: 1425, name: "Constrained Subsequence Sum",                              slug: "constrained-subsequence-sum",                                topic: "DP", difficulty: "Hard" },
  { num: 1434, name: "Number of Ways to Wear Different Hats to Each Other",      slug: "number-of-ways-to-wear-different-hats-to-each-other",        topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1439, name: "Find the Kth Smallest Sum of a Matrix With Sorted Rows",   slug: "find-the-kth-smallest-sum-of-a-matrix-with-sorted-rows",     topic: "Heap", difficulty: "Hard" },
  { num: 1444, name: "Number of Ways of Cutting a Pizza",                        slug: "number-of-ways-of-cutting-a-pizza",                          topic: "DP", difficulty: "Hard" },
  { num: 1449, name: "Form Largest Integer With Digits That Add up to Target",   slug: "form-largest-integer-with-digits-that-add-up-to-target",     topic: "DP", difficulty: "Hard" },
  { num: 1458, name: "Max Dot Product of Two Subsequences",                      slug: "max-dot-product-of-two-subsequences",                        topic: "DP", difficulty: "Hard" },
  { num: 1463, name: "Cherry Pickup II",                                         slug: "cherry-pickup-ii",                                           topic: "DP", difficulty: "Hard" },
  { num: 1473, name: "Paint House III",                                          slug: "paint-house-iii",                                            topic: "DP", difficulty: "Hard" },
  { num: 1478, name: "Allocate Mailboxes",                                       slug: "allocate-mailboxes",                                         topic: "DP", difficulty: "Hard" },
  { num: 1483, name: "Kth Ancestor of a Tree Node",                              slug: "kth-ancestor-of-a-tree-node",                                topic: "Binary Lifting", difficulty: "Hard" },
  { num: 1494, name: "Parallel Courses II",                                      slug: "parallel-courses-ii",                                        topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1521, name: "Find a Value of a Mysterious Function Closest to Target",  slug: "find-a-value-of-a-mysterious-function-closest-to-target",    topic: "Bit Manipulation", difficulty: "Hard" },
  { num: 1526, name: "Minimum Number of Increments on Subarrays to Form a Target Array", slug: "minimum-number-of-increments-on-subarrays-to-form-a-target-array", topic: "Stack", difficulty: "Hard" },
  { num: 1537, name: "Get the Maximum Score",                                    slug: "get-the-maximum-score",                                      topic: "DP", difficulty: "Hard" },
  { num: 1542, name: "Find Longest Awesome Substring",                           slug: "find-longest-awesome-substring",                             topic: "Bit Manipulation", difficulty: "Hard" },
  { num: 1553, name: "Minimum Number of Days to Eat N Oranges",                  slug: "minimum-number-of-days-to-eat-n-oranges",                    topic: "DP", difficulty: "Hard" },
  { num: 1559, name: "Detect Cycles in 2D Grid",                                 slug: "detect-cycles-in-2d-grid",                                   topic: "DSU", difficulty: "Hard" },
  { num: 1563, name: "Stone Game V",                                             slug: "stone-game-v",                                               topic: "DP", difficulty: "Hard" },
  { num: 1579, name: "Remove Max Number of Edges to Keep Graph Fully Traversable",slug: "remove-max-number-of-edges-to-keep-graph-fully-traversable", topic: "DSU", difficulty: "Hard" },
  { num: 1591, name: "Strange Printer II",                                       slug: "strange-printer-ii",                                         topic: "Graph", difficulty: "Hard" },
  { num: 1595, name: "Minimum Cost to Connect Two Groups of Points",             slug: "minimum-cost-to-connect-two-groups-of-points",               topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1601, name: "Maximum Number of Achievable Transfer Requests",           slug: "maximum-number-of-achievable-transfer-requests",             topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1617, name: "Count Subtrees With Max Distance Between Cities",          slug: "count-subtrees-with-max-distance-between-cities",            topic: "Tree", difficulty: "Hard" },
  { num: 1627, name: "Graph Connectivity With Threshold",                        slug: "graph-connectivity-with-threshold",                          topic: "DSU", difficulty: "Hard" },
  { num: 1639, name: "Number of Ways to Form a Target String Given a Dictionary",slug: "number-of-ways-to-form-a-target-string-given-a-dictionary",  topic: "DP", difficulty: "Hard" },
  { num: 1649, name: "Create Sorted Array through Instructions",                 slug: "create-sorted-array-through-instructions",                   topic: "Segment Tree", difficulty: "Hard" },
  { num: 1655, name: "Distribute Repeating Integers",                            slug: "distribute-repeating-integers",                              topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1671, name: "Minimum Number of Removals to Make Mountain Array",        slug: "minimum-number-of-removals-to-make-mountain-array",          topic: "DP", difficulty: "Hard" },
  { num: 1675, name: "Minimize Deviation in Array",                              slug: "minimize-deviation-in-array",                                topic: "Heap", difficulty: "Hard" },
  { num: 1691, name: "Maximum Height by Stacking Cuboids",                       slug: "maximum-height-by-stacking-cuboids",                         topic: "DP", difficulty: "Hard" },
  { num: 1697, name: "Checking Existence of Edge Length Limited Paths",          slug: "checking-existence-of-edge-length-limited-paths",            topic: "DSU", difficulty: "Hard" },
  { num: 1703, name: "Minimum Adjacent Swaps for K Consecutive Ones",            slug: "minimum-adjacent-swaps-for-k-consecutive-ones",              topic: "Greedy", difficulty: "Hard" },
  { num: 1707, name: "Maximum XOR With an Element From Array",                   slug: "maximum-xor-with-an-element-from-array",                     topic: "Trie", difficulty: "Hard" },
  { num: 1713, name: "Minimum Operations to Make a Subsequence",                 slug: "minimum-operations-to-make-a-subsequence",                   topic: "Segment Tree", difficulty: "Hard" },
  { num: 1722, name: "Minimize Hamming Distance After Swap Operations",          slug: "minimize-hamming-distance-after-swap-operations",            topic: "DSU", difficulty: "Hard" },
  { num: 1723, name: "Find Minimum Time to Finish All Jobs",                     slug: "find-minimum-time-to-finish-all-jobs",                       topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1751, name: "Maximum Number of Events That Can Be Attended II",         slug: "maximum-number-of-events-that-can-be-attended-ii",           topic: "DP", difficulty: "Hard" },
  { num: 1755, name: "Closest Subsequence Sum",                                  slug: "closest-subsequence-sum",                                    topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1761, name: "Minimum Degree of a Connected Trio in a Graph",            slug: "minimum-degree-of-a-connected-trio-in-a-graph",              topic: "Graph", difficulty: "Hard" },
  { num: 1766, name: "Tree of Coprimes",                                         slug: "tree-of-coprimes",                                           topic: "Tree", difficulty: "Hard" },
  { num: 1782, name: "Count Pairs Of Nodes",                                     slug: "count-pairs-of-nodes",                                       topic: "Graph", difficulty: "Hard" },
  { num: 1787, name: "Make the XOR of All Segments Equal to Zero",               slug: "make-the-xor-of-all-segments-equal-to-zero",                 topic: "DP", difficulty: "Hard" },
  { num: 1793, name: "Maximum Score of a Good Subarray",                         slug: "maximum-score-of-a-good-subarray",                           topic: "Stack", difficulty: "Hard" },
  { num: 1798, name: "Maximum Number of Consecutive Values You Can Make",        slug: "maximum-number-of-consecutive-values-you-can-make",          topic: "Greedy", difficulty: "Hard" },
  { num: 1799, name: "Maximize Score After N Operations",                        slug: "maximize-score-after-n-operations",                          topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1803, name: "Count Pairs With XOR in a Range",                          slug: "count-pairs-with-xor-in-a-range",                            topic: "Trie", difficulty: "Hard" },
  { num: 1815, name: "Maximum Number of Groups Getting Fresh Donuts",            slug: "maximum-number-of-groups-getting-fresh-donuts",              topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1819, name: "Number of Different Subsequences GCDs",                    slug: "number-of-different-subsequences-gcds",                      topic: "Math", difficulty: "Hard" },
  { num: 1835, name: "Find XOR Sum of All Pairs Bitwise AND",                    slug: "find-xor-sum-of-all-pairs-bitwise-and",                      topic: "Bit Manipulation", difficulty: "Hard" },
  { num: 1851, name: "Minimum Interval to Include Each Query",                   slug: "minimum-interval-to-include-each-query",                     topic: "Heap", difficulty: "Hard" },
  { num: 1857, name: "Largest Color Value in a Directed Graph",                  slug: "largest-color-value-in-a-directed-graph",                    topic: "Graph", difficulty: "Hard" },
  { num: 1862, name: "Sum of Floored Pairs",                                     slug: "sum-of-floored-pairs",                                       topic: "Math", difficulty: "Hard" },
  { num: 1866, name: "Number of Ways to Rearrange Sticks With K Sticks Visible", slug: "number-of-ways-to-rearrange-sticks-with-k-sticks-visible",   topic: "DP", difficulty: "Hard" },
  { num: 1871, name: "Jump Game VII",                                            slug: "jump-game-vii",                                              topic: "Sliding Window", difficulty: "Hard" },
  { num: 1872, name: "Stone Game VIII",                                          slug: "stone-game-viii",                                            topic: "DP", difficulty: "Hard" },
  { num: 1879, name: "Minimum XOR Sum of Two Arrays",                            slug: "minimum-xor-sum-of-two-arrays",                              topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1916, name: "Count Ways to Build Rooms in an Ant Colony",               slug: "count-ways-to-build-rooms-in-an-ant-colony",                 topic: "Tree", difficulty: "Hard" },
  { num: 1928, name: "Minimum Cost to Reach Destination in Time",                slug: "minimum-cost-to-reach-destination-in-time",                  topic: "DP", difficulty: "Hard" },
  { num: 1931, name: "Painting a Grid With Three Different Colors",              slug: "painting-a-grid-with-three-different-colors",                topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1932, name: "Merge BSTs to Create Single BST",                          slug: "merge-bsts-to-create-single-bst",                            topic: "Tree", difficulty: "Hard" },
  { num: 1938, name: "Maximum Genetic Difference Query",                          slug: "maximum-genetic-difference-query",                           topic: "Trie", difficulty: "Hard" },
  { num: 1944, name: "Number of Visible People in a Queue",                      slug: "number-of-visible-people-in-a-queue",                        topic: "Stack", difficulty: "Hard" },
  { num: 1955, name: "Count Number of Special Subsequences",                     slug: "count-number-of-special-subsequences",                       topic: "DP", difficulty: "Hard" },
  { num: 1969, name: "Minimum Non-Zero Product of the Array Elements",           slug: "minimum-non-zero-product-of-the-array-elements",             topic: "Math", difficulty: "Hard" },
  { num: 1987, name: "Number of Unique Good Subsequences",                       slug: "number-of-unique-good-subsequences",                         topic: "DP", difficulty: "Hard" },
  { num: 1994, name: "The Number of Good Subsets",                               slug: "the-number-of-good-subsets",                                  topic: "Bitmask DP", difficulty: "Hard" },
  { num: 1998, name: "GCD Sort of an Array",                                     slug: "gcd-sort-of-an-array",                                       topic: "DSU", difficulty: "Hard" },
  { num: 2003, name: "Smallest Missing Genetic Value in Each Subtree",           slug: "smallest-missing-genetic-value-in-each-subtree",             topic: "DSU", difficulty: "Hard" },
  { num: 2009, name: "Minimum Number of Operations to Make Array Continuous",    slug: "minimum-number-of-operations-to-make-array-continuous",      topic: "Sliding Window", difficulty: "Hard" },
  { num: 2014, name: "Longest Subsequence Repeated k Times",                     slug: "longest-subsequence-repeated-k-times",                       topic: "Greedy", difficulty: "Hard" },
  { num: 2019, name: "The Score of Students Solving Math Expression",            slug: "the-score-of-students-solving-math-expression",              topic: "DP", difficulty: "Hard" },
  { num: 2035, name: "Partition Array Into Two Arrays to Minimize Sum Difference",slug: "partition-array-into-two-arrays-to-minimize-sum-difference",  topic: "Bitmask DP", difficulty: "Hard" },
  { num: 2040, name: "Kth Smallest Product of Two Sorted Arrays",                slug: "kth-smallest-product-of-two-sorted-arrays",                  topic: "Binary Search", difficulty: "Hard" },
  { num: 2050, name: "Parallel Courses III",                                     slug: "parallel-courses-iii",                                       topic: "Graph", difficulty: "Hard" },
  { num: 2065, name: "Maximum Path Quality of a Graph",                          slug: "maximum-path-quality-of-a-graph",                            topic: "Graph", difficulty: "Hard" },
  { num: 2071, name: "Maximum Number of Tasks You Can Assign",                   slug: "maximum-number-of-tasks-you-can-assign",                     topic: "Binary Search", difficulty: "Hard" },
  { num: 2101, name: "Detonate the Maximum Bombs",                               slug: "detonate-the-maximum-bombs-2",                               topic: "Graph", difficulty: "Hard" },
  { num: 2116, name: "Check if a Parentheses String Can Be Valid",               slug: "check-if-a-parentheses-string-can-be-valid",                 topic: "Greedy", difficulty: "Hard" },
  { num: 2127, name: "Maximum Employees to Be Invited to a Meeting",             slug: "maximum-employees-to-be-invited-to-a-meeting",               topic: "Graph", difficulty: "Hard" },
  { num: 2147, name: "Number of Ways to Divide a Long Corridor",                 slug: "number-of-ways-to-divide-a-long-corridor",                   topic: "Math", difficulty: "Hard" },
  { num: 2157, name: "Groups of Strings",                                        slug: "groups-of-strings",                                          topic: "DSU", difficulty: "Hard" },
  { num: 2163, name: "Minimum Difference in Sums After Removal of Elements",     slug: "minimum-difference-in-sums-after-removal-of-elements",       topic: "Heap", difficulty: "Hard" },
  { num: 2172, name: "Maximum AND Sum of Array",                                 slug: "maximum-and-sum-of-array",                                   topic: "Bitmask DP", difficulty: "Hard" },
  { num: 2193, name: "Minimum Number of Moves to Make Palindrome",               slug: "minimum-number-of-moves-to-make-palindrome",                 topic: "Greedy", difficulty: "Hard" },
  { num: 2197, name: "Replace Non-Coprime Numbers in Array",                     slug: "replace-non-coprime-numbers-in-array",                       topic: "Math", difficulty: "Hard" },
  { num: 2272, name: "Substring With Largest Variance",                          slug: "substring-with-largest-variance",                            topic: "DP", difficulty: "Hard" },
  { num: 2302, name: "Count Subarrays With Score Less Than K",                   slug: "count-subarrays-with-score-less-than-k-2",                   topic: "Sliding Window", difficulty: "Hard" },
  { num: 2338, name: "Count the Number of Ideal Arrays",                         slug: "count-the-number-of-ideal-arrays-2",                         topic: "Math", difficulty: "Hard" },
  { num: 2407, name: "Longest Increasing Subsequence II",                        slug: "longest-increasing-subsequence-ii-2",                        topic: "Segment Tree", difficulty: "Hard" },
  { num: 2421, name: "Number of Good Paths",                                     slug: "number-of-good-paths-2",                                     topic: "DSU", difficulty: "Hard" },
  { num: 2444, name: "Count Subarrays With Fixed Bounds",                        slug: "count-subarrays-with-fixed-bounds-2",                        topic: "Sliding Window", difficulty: "Hard" },
  { num: 2440, name: "Create Components With Same Value",                        slug: "create-components-with-same-value-2",                        topic: "Tree", difficulty: "Hard" },
  { num: 2487, name: "Remove Nodes From Linked List",                            slug: "remove-nodes-from-linked-list",                              topic: "Stack", difficulty: "Hard" },
  { num: 2518, name: "Number of Great Partitions",                               slug: "number-of-great-partitions-2",                               topic: "DP", difficulty: "Hard" },
  { num: 2537, name: "Count the Number of Good Subarrays",                       slug: "count-the-number-of-good-subarrays-2",                       topic: "Hashing", difficulty: "Hard" },
  { num: 2568, name: "Minimum Impossible OR",                                    slug: "minimum-impossible-or",                                      topic: "Greedy", difficulty: "Hard" },
  { num: 2603, name: "Collect Coins in a Tree",                                  slug: "collect-coins-in-a-tree-2",                                  topic: "Tree", difficulty: "Hard" },
  { num: 2608, name: "Shortest Cycle in a Graph",                                slug: "shortest-cycle-in-a-graph",                                  topic: "BFS", difficulty: "Hard" },
  { num: 2646, name: "Minimize the Total Price of the Trips",                    slug: "minimize-the-total-price-of-the-trips-2",                    topic: "Tree", difficulty: "Hard" },
  { num: 2659, name: "Make Array Empty",                                         slug: "make-array-empty-2",                                         topic: "Segment Tree", difficulty: "Hard" },
  { num: 2663, name: "Lexicographically Smallest Beautiful String",              slug: "lexicographically-smallest-beautiful-string-2",              topic: "Greedy", difficulty: "Hard" },
  { num: 2742, name: "Painting the Walls",                                       slug: "painting-the-walls",                                         topic: "DP", difficulty: "Hard" },
  { num: 2809, name: "Minimum Time to Make Array Sum At Most x",                 slug: "minimum-time-to-make-array-sum-at-most-x-2",                 topic: "DP", difficulty: "Hard" },
  { num: 2812, name: "Find the Safest Path in a Grid",                           slug: "find-the-safest-path-in-a-grid-2",                           topic: "BFS", difficulty: "Hard" },
  { num: 2813, name: "Maximum Elegance of a K-Length Subsequence",               slug: "maximum-elegance-of-a-k-length-subsequence",                 topic: "Greedy", difficulty: "Hard" },
  { num: 2836, name: "Maximize Value of Function in a Ball Passing Game",        slug: "maximize-value-of-function-in-a-ball-passing-game-2",        topic: "Binary Lifting", difficulty: "Hard" },
  { num: 2846, name: "Minimum Edge Weight Equilibrium Queries in a Tree",        slug: "minimum-edge-weight-equilibrium-queries-in-a-tree-2",        topic: "Tree", difficulty: "Hard" },
  { num: 2858, name: "Minimum Edge Reversals So Every Node Is Reachable",        slug: "minimum-edge-reversals-so-every-node-is-reachable-2",        topic: "Tree", difficulty: "Hard" },
  { num: 2876, name: "Count Visited Nodes in a Directed Graph",                  slug: "count-visited-nodes-in-a-directed-graph-2",                  topic: "Graph", difficulty: "Hard" },
  { num: 2920, name: "Maximum Points After Collecting Coins From All Nodes",     slug: "maximum-points-after-collecting-coins-from-all-nodes-2",     topic: "Tree", difficulty: "Hard" },
  { num: 2973, name: "Find Number of Coins to Place in Tree Nodes",              slug: "find-number-of-coins-to-place-in-tree-nodes-2",              topic: "Tree", difficulty: "Hard" },
  { num: 3116, name: "Kth Smallest Amount With Single Denomination Combination", slug: "kth-smallest-amount-with-single-denomination-combination-2", topic: "Binary Search", difficulty: "Hard" },
  { num: 3130, name: "Find All Possible Stable Binary Arrays II",                slug: "find-all-possible-stable-binary-arrays-ii",                  topic: "DP", difficulty: "Hard" },
  { num: 3139, name: "Minimum Cost to Equalize Array",                           slug: "minimum-cost-to-equalize-array-2",                           topic: "Math", difficulty: "Hard" },
  { num: 3145, name: "Find Products of Elements of Big Array",                   slug: "find-products-of-elements-of-big-array-2",                   topic: "Binary Search", difficulty: "Hard" },
  { num: 3261, name: "Count Substrings That Satisfy K-Constraint II",            slug: "count-substrings-that-satisfy-k-constraint-ii",              topic: "Sliding Window", difficulty: "Hard" },
  { num: 3266, name: "Final Array State After K Multiplication Operations II",   slug: "final-array-state-after-k-multiplication-operations-ii-2",   topic: "Heap", difficulty: "Hard" },
  { num: 3306, name: "Count of Substrings Containing Every Vowel and K Consonants II", slug: "count-of-substrings-containing-every-vowel-and-k-consonants-ii", topic: "Sliding Window", difficulty: "Hard" },
  { num: 3312, name: "Sorted GCD Pair Queries",                                  slug: "sorted-gcd-pair-queries",                                    topic: "Math", difficulty: "Hard" },
  { num: 3317, name: "Find the Number of Possible Ways for an Event",            slug: "find-the-number-of-possible-ways-for-an-event",              topic: "Math", difficulty: "Hard" },
  { num: 3327, name: "Check if DFS Strings Are Palindromes",                     slug: "check-if-dfs-strings-are-palindromes",                       topic: "String", difficulty: "Hard" },
  { num: 3337, name: "Total Characters in String After Transformations II",      slug: "total-characters-in-string-after-transformations-ii",        topic: "Math", difficulty: "Hard" },
  { num: 3351, name: "Sum of Good Subsequences",                                 slug: "sum-of-good-subsequences",                                   topic: "Hashing", difficulty: "Hard" },
  { num: 3362, name: "Zero Array Transformation III",                            slug: "zero-array-transformation-iii",                              topic: "Greedy", difficulty: "Hard" },
  { num: 3367, name: "Maximize Sum of Weights after Edge Removals",              slug: "maximize-sum-of-weights-after-edge-removals",                topic: "Tree", difficulty: "Hard" },
  { num: 3378, name: "Count Connected Components in LCM Graph",                  slug: "count-connected-components-in-lcm-graph",                    topic: "DSU", difficulty: "Hard" },
  { num: 3381, name: "Maximum Subarray Sum With Length Divisible by K",          slug: "maximum-subarray-sum-with-length-divisible-by-k",            topic: "Hashing", difficulty: "Hard" },
  { num: 3429, name: "Paint House IV",                                           slug: "paint-house-iv",                                             topic: "DP", difficulty: "Hard" },
  { num: 3448, name: "Count Substrings Divisible By Last Digit",                 slug: "count-substrings-divisible-by-last-digit",                   topic: "DP", difficulty: "Hard" },
  // ── Greedy Problems ──
  // Phase 1: Basic Greedy
  { num: 455,  name: "Assign Cookies",                                         slug: "assign-cookies",                                             topic: "Greedy", difficulty: "Hard" },
  { num: 1005, name: "Maximize Sum Of Array After K Negations",                slug: "maximize-sum-of-array-after-k-negations",                   topic: "Greedy", difficulty: "Hard" },
  { num: 976,  name: "Largest Perimeter Triangle",                             slug: "largest-perimeter-triangle",                                topic: "Greedy", difficulty: "Hard" },
  { num: 1710, name: "Maximum Units on a Truck",                               slug: "maximum-units-on-a-truck",                                  topic: "Greedy", difficulty: "Hard" },
  { num: 1403, name: "Minimum Subsequence in Non-Increasing Order",            slug: "minimum-subsequence-in-non-increasing-order",               topic: "Greedy", difficulty: "Hard" },
  { num: 561,  name: "Array Partition",                                        slug: "array-partition",                                           topic: "Greedy", difficulty: "Hard" },
  { num: 881,  name: "Boats to Save People",                                   slug: "boats-to-save-people",                                      topic: "Greedy", difficulty: "Hard" },
  { num: 1217, name: "Minimum Cost to Move Chips to The Same Position",        slug: "minimum-cost-to-move-chips-to-the-same-position",           topic: "Greedy", difficulty: "Hard" },
  { num: 991,  name: "Broken Calculator",                                      slug: "broken-calculator",                                         topic: "Greedy", difficulty: "Hard" },
  { num: 2645, name: "Minimum Additions to Make Valid String",                 slug: "minimum-additions-to-make-valid-string",                    topic: "Greedy", difficulty: "Hard" },
  { num: 605,  name: "Can Place Flowers",                                      slug: "can-place-flowers",                                         topic: "Greedy", difficulty: "Hard" },
  { num: 860,  name: "Lemonade Change",                                        slug: "lemonade-change",                                           topic: "Greedy", difficulty: "Hard" },
  { num: 874,  name: "Walking Robot Simulation",                               slug: "walking-robot-simulation",                                  topic: "Greedy", difficulty: "Hard" },
  { num: 452,  name: "Minimum Number of Arrows to Burst Balloons",             slug: "minimum-number-of-arrows-to-burst-balloons",                topic: "Greedy", difficulty: "Hard" },
  { num: 1029, name: "Two City Scheduling",                                    slug: "two-city-scheduling",                                       topic: "Greedy", difficulty: "Hard" },
  // Phase 2: Interval Problems
  { num: 252,  name: "Meeting Rooms",                                          slug: "meeting-rooms",                                             topic: "Greedy", difficulty: "Hard" },
  { num: 253,  name: "Meeting Rooms II",                                       slug: "meeting-rooms-ii",                                          topic: "Greedy", difficulty: "Hard" },
  { num: 56,   name: "Merge Intervals",                                        slug: "merge-intervals",                                           topic: "Greedy", difficulty: "Hard" },
  { num: 57,   name: "Insert Interval",                                        slug: "insert-interval",                                           topic: "Greedy", difficulty: "Hard" },
  { num: 435,  name: "Non-overlapping Intervals",                              slug: "non-overlapping-intervals",                                 topic: "Greedy", difficulty: "Hard" },
  { num: 986,  name: "Interval List Intersections",                            slug: "interval-list-intersections",                               topic: "Greedy", difficulty: "Hard" },
  { num: 759,  name: "Employee Free Time",                                     slug: "employee-free-time",                                        topic: "Greedy", difficulty: "Hard" },
  { num: 1288, name: "Remove Covered Intervals",                               slug: "remove-covered-intervals",                                  topic: "Greedy", difficulty: "Hard" },
  { num: 1353, name: "Maximum Number of Events That Can Be Attended",          slug: "maximum-number-of-events-that-can-be-attended",             topic: "Greedy", difficulty: "Hard" },
  { num: 1235, name: "Maximum Profit in Job Scheduling",                       slug: "maximum-profit-in-job-scheduling",                          topic: "Greedy", difficulty: "Hard" },
  { num: 2406, name: "Divide Intervals Into Minimum Number of Groups",         slug: "divide-intervals-into-minimum-number-of-groups",            topic: "Greedy", difficulty: "Hard" },
  { num: 1751, name: "Maximum Number of Events That Can Be Attended II",       slug: "maximum-number-of-events-that-can-be-attended-ii",          topic: "Greedy", difficulty: "Hard" },
  { num: 1851, name: "Minimum Interval to Include Each Query",                 slug: "minimum-interval-to-include-each-query",                    topic: "Greedy", difficulty: "Hard" },
  { num: 1094, name: "Car Pooling",                                            slug: "car-pooling",                                               topic: "Greedy", difficulty: "Hard" },
  // Phase 3: Greedy with Two Pointers
  { num: 11,   name: "Container With Most Water",                              slug: "container-with-most-water",                                 topic: "Greedy", difficulty: "Hard" },
  { num: 948,  name: "Bag of Tokens",                                          slug: "bag-of-tokens",                                             topic: "Greedy", difficulty: "Hard" },
  { num: 611,  name: "Valid Triangle Number",                                  slug: "valid-triangle-number",                                     topic: "Greedy", difficulty: "Hard" },
  { num: 259,  name: "3Sum Smaller",                                           slug: "3sum-smaller",                                              topic: "Greedy", difficulty: "Hard" },
  { num: 1877, name: "Minimize Maximum Pair Sum in Array",                     slug: "minimize-maximum-pair-sum-in-array",                        topic: "Greedy", difficulty: "Hard" },
  { num: 1013, name: "Partition Array Into Three Parts With Equal Sum",        slug: "partition-array-into-three-parts-with-equal-sum",           topic: "Greedy", difficulty: "Hard" },
  { num: 2193, name: "Minimum Number of Moves to Make Palindrome",             slug: "minimum-number-of-moves-to-make-palindrome",                topic: "Greedy", difficulty: "Hard" },
  { num: 1405, name: "Longest Happy String",                                   slug: "longest-happy-string",                                      topic: "Greedy", difficulty: "Hard" },
  { num: 1400, name: "Construct K Palindrome Strings",                         slug: "construct-k-palindrome-strings",                            topic: "Greedy", difficulty: "Hard" },
  // Phase 4: Greedy String Problems
  { num: 402,  name: "Remove K Digits",                                        slug: "remove-k-digits",                                           topic: "Greedy", difficulty: "Hard" },
  { num: 316,  name: "Remove Duplicate Letters",                               slug: "remove-duplicate-letters",                                  topic: "Greedy", difficulty: "Hard" },
  { num: 1081, name: "Smallest Subsequence of Distinct Characters",            slug: "smallest-subsequence-of-distinct-characters",               topic: "Greedy", difficulty: "Hard" },
  { num: 763,  name: "Partition Labels",                                       slug: "partition-labels",                                          topic: "Greedy", difficulty: "Hard" },
  { num: 1221, name: "Split a String in Balanced Strings",                     slug: "split-a-string-in-balanced-strings",                        topic: "Greedy", difficulty: "Hard" },
  { num: 1647, name: "Minimum Deletions to Make Character Frequencies Unique", slug: "minimum-deletions-to-make-character-frequencies-unique",    topic: "Greedy", difficulty: "Hard" },
  { num: 606,  name: "Construct String from Binary Tree",                      slug: "construct-string-from-binary-tree",                         topic: "Greedy", difficulty: "Hard" },
  { num: 1963, name: "Minimum Number of Swaps to Make the String Balanced",    slug: "minimum-number-of-swaps-to-make-the-string-balanced",       topic: "Greedy", difficulty: "Hard" },
  { num: 1898, name: "Maximum Number of Removable Characters",                 slug: "maximum-number-of-removable-characters",                    topic: "Greedy", difficulty: "Hard" },
  // Phase 5: Greedy with Priority Queue/Heap
  { num: 1046, name: "Last Stone Weight",                                      slug: "last-stone-weight",                                         topic: "Greedy", difficulty: "Hard" },
  { num: 621,  name: "Task Scheduler",                                         slug: "task-scheduler",                                            topic: "Greedy", difficulty: "Hard" },
  { num: 767,  name: "Reorganize String",                                      slug: "reorganize-string",                                         topic: "Greedy", difficulty: "Hard" },
  { num: 857,  name: "Minimum Cost to Hire K Workers",                         slug: "minimum-cost-to-hire-k-workers",                            topic: "Greedy", difficulty: "Hard" },
  { num: 502,  name: "IPO",                                                    slug: "ipo",                                                       topic: "Greedy", difficulty: "Hard" },
  { num: 373,  name: "Find K Pairs with Smallest Sums",                        slug: "find-k-pairs-with-smallest-sums",                           topic: "Greedy", difficulty: "Hard" },
  { num: 215,  name: "Kth Largest Element in an Array",                        slug: "kth-largest-element-in-an-array",                           topic: "Greedy", difficulty: "Hard" },
  { num: 347,  name: "Top K Frequent Elements",                                slug: "top-k-frequent-elements",                                   topic: "Greedy", difficulty: "Hard" },
  { num: 1383, name: "Maximum Performance of a Team",                          slug: "maximum-performance-of-a-team",                             topic: "Greedy", difficulty: "Hard" },
  { num: 1167, name: "Minimum Cost to Connect Sticks",                         slug: "minimum-cost-to-connect-sticks",                            topic: "Greedy", difficulty: "Hard" },
  { num: 1338, name: "Reduce Array Size to The Half",                          slug: "reduce-array-size-to-the-half",                             topic: "Greedy", difficulty: "Hard" },
  { num: 1642, name: "Furthest Building You Can Reach",                        slug: "furthest-building-you-can-reach",                           topic: "Greedy", difficulty: "Hard" },
  { num: 1845, name: "Seat Reservation Manager",                               slug: "seat-reservation-manager",                                  topic: "Greedy", difficulty: "Hard" },
  // Phase 6: Jump Game & Reachability
  { num: 55,   name: "Jump Game",                                              slug: "jump-game",                                                 topic: "Greedy", difficulty: "Hard" },
  { num: 45,   name: "Jump Game II",                                           slug: "jump-game-ii",                                              topic: "Greedy", difficulty: "Hard" },
  { num: 1306, name: "Jump Game III",                                          slug: "jump-game-iii",                                             topic: "Greedy", difficulty: "Hard" },
  { num: 1345, name: "Jump Game IV",                                           slug: "jump-game-iv",                                              topic: "Greedy", difficulty: "Hard" },
  { num: 1340, name: "Jump Game V",                                            slug: "jump-game-v",                                               topic: "Greedy", difficulty: "Hard" },
  { num: 1696, name: "Jump Game VI",                                           slug: "jump-game-vi",                                              topic: "Greedy", difficulty: "Hard" },
  { num: 1871, name: "Jump Game VII",                                          slug: "jump-game-vii",                                             topic: "Greedy", difficulty: "Hard" },
  { num: 1326, name: "Minimum Number of Taps to Open to Water a Garden",       slug: "minimum-number-of-taps-to-open-to-water-a-garden",          topic: "Greedy", difficulty: "Hard" },
  // Phase 7: Stock Problems & State Transitions
  { num: 121,  name: "Best Time to Buy and Sell Stock",                        slug: "best-time-to-buy-and-sell-stock",                           topic: "Greedy", difficulty: "Hard" },
  { num: 122,  name: "Best Time to Buy and Sell Stock II",                     slug: "best-time-to-buy-and-sell-stock-ii",                        topic: "Greedy", difficulty: "Hard" },
  { num: 714,  name: "Best Time to Buy and Sell Stock with Transaction Fee",   slug: "best-time-to-buy-and-sell-stock-with-transaction-fee",      topic: "Greedy", difficulty: "Hard" },
  { num: 309,  name: "Best Time to Buy and Sell Stock with Cooldown",          slug: "best-time-to-buy-and-sell-stock-with-cooldown",             topic: "Greedy", difficulty: "Hard" },
  { num: 376,  name: "Wiggle Subsequence",                                     slug: "wiggle-subsequence",                                        topic: "Greedy", difficulty: "Hard" },
  { num: 53,   name: "Maximum Subarray",                                       slug: "maximum-subarray",                                          topic: "Greedy", difficulty: "Hard" },
  { num: 918,  name: "Maximum Sum Circular Subarray",                          slug: "maximum-sum-circular-subarray",                             topic: "Greedy", difficulty: "Hard" },
  // Phase 8: Advanced Greedy
  { num: 406,  name: "Queue Reconstruction by Height",                         slug: "queue-reconstruction-by-height",                            topic: "Greedy", difficulty: "Hard" },
  { num: 871,  name: "Minimum Number of Refueling Stops",                      slug: "minimum-number-of-refueling-stops",                         topic: "Greedy", difficulty: "Hard" },
  { num: 330,  name: "Patching Array",                                         slug: "patching-array",                                            topic: "Greedy", difficulty: "Hard" },
  { num: 321,  name: "Create Maximum Number",                                  slug: "create-maximum-number",                                     topic: "Greedy", difficulty: "Hard" },
  { num: 546,  name: "Remove Boxes",                                           slug: "remove-boxes",                                              topic: "Greedy", difficulty: "Hard" },
  { num: 632,  name: "Smallest Range Covering Elements from K Lists",          slug: "smallest-range-covering-elements-from-k-lists",             topic: "Greedy", difficulty: "Hard" },
  { num: 870,  name: "Advantage Shuffle",                                      slug: "advantage-shuffle",                                         topic: "Greedy", difficulty: "Hard" },
  { num: 846,  name: "Hand of Straights",                                      slug: "hand-of-straights",                                         topic: "Greedy", difficulty: "Hard" },
];

// Deduplicate by slug (stable id)
const seen = new Set();
const PROBLEMS = PROBLEMS_RAW.filter(p => {
  if (seen.has(p.slug)) return false;
  seen.add(p.slug);
  return true;
}).map(p => ({ ...p, id: p.slug }));

const TOPIC_PALETTE = {
  "DP":             { bg: "#1a1200", border: "#854d0e", text: "#fbbf24" },
  "Graph":          { bg: "#001a0d", border: "#065f46", text: "#34d399" },
  "Tree":           { bg: "#001520", border: "#0e4f6e", text: "#38bdf8" },
  "Greedy":         { bg: "#160020", border: "#5b21b6", text: "#c084fc" },
  "Binary Search":  { bg: "#001020", border: "#1e3a5f", text: "#60a5fa" },
  "Segment Tree":   { bg: "#1a0800", border: "#9a3412", text: "#fb923c" },
  "Bit Manipulation":{ bg:"#0d1a00", border: "#3f6212", text: "#a3e635" },
  "Stack":          { bg: "#1a0000", border: "#991b1b", text: "#f87171" },
  "Sliding Window": { bg: "#001520", border: "#155e75", text: "#22d3ee" },
  "Hashing":        { bg: "#0f0020", border: "#4c1d95", text: "#a78bfa" },
  "Math":           { bg: "#1a1200", border: "#92400e", text: "#fcd34d" },
  "Trie":           { bg: "#001a10", border: "#064e3b", text: "#6ee7b7" },
  "DSU":            { bg: "#1a000d", border: "#881337", text: "#fb7185" },
  "BFS":            { bg: "#00101a", border: "#0c4a6e", text: "#7dd3fc" },
  "String":         { bg: "#15001a", border: "#701a75", text: "#e879f9" },
  "Heap":           { bg: "#1a1000", border: "#78350f", text: "#fdba74" },
  "Digit DP":       { bg: "#0d1200", border: "#365314", text: "#bef264" },
  "Bitmask DP":     { bg: "#1a001a", border: "#831843", text: "#f9a8d4" },
  "BIT":            { bg: "#001a1a", border: "#134e4a", text: "#5eead4" },
  "Binary Lifting": { bg: "#120800", border: "#7c2d12", text: "#fdba74" },
  "Array":          { bg: "#0f0f1a", border: "#312e81", text: "#818cf8" },
  "Prefix Sum":     { bg: "#001a0a", border: "#14532d", text: "#86efac" },
  "Design":         { bg: "#1a0f00", border: "#7c3d00", text: "#fed7aa" },
  "Sorting":        { bg: "#101a00", border: "#3a5c00", text: "#d9f99d" },
  "Linked List":    { bg: "#001010", border: "#0f4c5c", text: "#67e8f9" },
};

function getStyle(topic) {
  return TOPIC_PALETTE[topic] || { bg: "#0a0a0a", border: "#333", text: "#aaa" };
}

const STORAGE_KEY = "lc_v4";
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function save(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }

const ALL_TOPICS = [...new Set(PROBLEMS.map(p => p.topic))].sort();

// ── Stats helpers ──
function buildTopicStats(state) {
  const map = {};
  for (const p of PROBLEMS) {
    if (!map[p.topic]) map[p.topic] = { total: 0, done: 0 };
    map[p.topic].total++;
    if (state[p.id]?.done) map[p.topic].done++;
  }
  return Object.entries(map)
    .map(([topic, { total, done }]) => ({ topic, total, done, pct: Math.round((done / total) * 100) }))
    .sort((a, b) => b.pct - a.pct || b.total - a.total);
}

export default function App() {
  const [state, setState] = useState(load);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [noteModal, setNoteModal] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [tab, setTab] = useState("problems"); // "problems" | "stats"
  const textRef = useRef(null);

  useEffect(() => { save(state); }, [state]);
  useEffect(() => { if (noteModal && textRef.current) textRef.current.focus(); }, [noteModal]);

  const toggle = id => setState(s => ({ ...s, [id]: { ...s[id], done: !s[id]?.done } }));
  const openNote = p => { setNoteModal(p); setNoteDraft(state[p.id]?.note || ""); };
  const saveNote = () => { setState(s => ({ ...s, [noteModal.id]: { ...s[noteModal.id], note: noteDraft } })); setNoteModal(null); };

  const solved = PROBLEMS.filter(p => state[p.id]?.done).length;
  const total = PROBLEMS.length;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  const visible = useMemo(() => {
    let list = PROBLEMS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || String(p.num).includes(q));
    }
    if (statusFilter === "done") list = list.filter(p => state[p.id]?.done);
    if (statusFilter === "todo") list = list.filter(p => !state[p.id]?.done);
    if (topicFilter !== "all") list = list.filter(p => p.topic === topicFilter);
    return list;
  }, [search, statusFilter, topicFilter, state]);

  const topicStats = useMemo(() => buildTopicStats(state), [state]);

  return (
    <div style={{ minHeight: "100vh", background: "#13161c", fontFamily: "'DM Mono', 'Courier New', monospace", color: "#d4dbe8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Inter:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #13161c; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #13161c; }
        ::-webkit-scrollbar-thumb { background: #2a3244; border-radius: 4px; }
        .row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #1c2130; transition: background .12s; }
        .row:last-child { border-bottom: none; }
        .row:hover { background: #181d28; }
        .row.is-done { opacity: .45; }
        .cb { width: 18px; height: 18px; border-radius: 4px; border: 1.5px solid #2e4060; background: transparent; cursor: pointer; flex-shrink: 0; margin-top: 3px; display: flex; align-items: center; justify-content: center; transition: all .12s; }
        .cb.checked { background: #1a4731; border-color: #3fb77a; }
        .btn { cursor: pointer; border-radius: 5px; font-family: inherit; font-size: 11px; padding: 4px 10px; transition: all .12s; white-space: nowrap; }
        .btn-lc { background: transparent; color: #d4dbe8; border: 1px solid #222b3a; text-decoration: none; display: inline-flex; align-items: center; gap: 3px; }
        .btn-lc:hover { color: #e8b84b; border-color: #6b4c1a; }
        .btn-note { background: transparent; color: #d4dbe8; border: 1px solid #222b3a; }
        .btn-note:hover { color: #9b8fef; border-color: #3d3470; }
        .btn-note.has-note { color: #9b8fef; border-color: #3d3470; }
        .chip { font-size: 10px; font-family: inherit; padding: 2px 7px; border-radius: 3px; border: 1px solid; font-weight: 600; letter-spacing: .3px; white-space: nowrap; }
        .filter-btn { cursor: pointer; font-family: inherit; font-size: 11px; padding: 5px 13px; border-radius: 4px; border: 1px solid #222b3a; background: transparent; color: #d4dbe8; transition: all .12s; }
        .filter-btn.active { color: #d4dbe8; border-color: #3a4a60; background: #1a2030; }
        .tab-btn { cursor: pointer; font-family: inherit; font-size: 12px; padding: 7px 18px; border-radius: 5px; border: 1px solid #222b3a; background: transparent; color: #d4dbe8; transition: all .12s; letter-spacing: 1px; }
        .tab-btn.active { color: #d4dbe8; border-color: #3a4a60; background: #1a2030; }
        select { background: #181d28; border: 1px solid #222b3a; border-radius: 4px; color: #7a90b0; font-family: inherit; font-size: 11px; padding: 5px 10px; outline: none; cursor: pointer; }
        select:focus { border-color: #3a4a60; }
        input[type=text] { background: #181d28; border: 1px solid #222b3a; border-radius: 4px; color: #d4dbe8; font-family: inherit; font-size: 12px; padding: 7px 12px; outline: none; width: 100%; transition: border-color .12s; }
        input[type=text]:focus { border-color: #3a4a60; }
        .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.75); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .modal { background: #181d28; border: 1px solid #2e4060; border-radius: 10px; padding: 22px; width: 100%; max-width: 480px; }
        textarea { background: #13161c; border: 1px solid #222b3a; border-radius: 5px; color: #d4dbe8; font-family: inherit; font-size: 12px; padding: 10px 12px; outline: none; width: 100%; resize: vertical; line-height: 1.7; }
        textarea:focus { border-color: #3a4a60; }
        .pbar { height: 4px; background: #1c2130; border-radius: 2px; overflow: hidden; }
        .pfill { height: 100%; background: linear-gradient(90deg, #1a5c3a, #3fb77a); transition: width .6s ease; }
        .stat-bar-outer { height: 6px; background: #1c2130; border-radius: 3px; overflow: hidden; flex: 1; }
        .stat-bar-inner { height: 100%; border-radius: 3px; transition: width .5s ease; }
        .stat-row { display: flex; align-items: center; gap: 10px; padding: 9px 16px; border-bottom: 1px solid #161b24; transition: background .12s; }
        .stat-row:hover { background: #181d28; }
        .stat-row:last-child { border-bottom: none; }
        .prob-name { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13.5px; color: #c8d4e8; line-height: 1.4; word-break: break-word; }
        .prob-name.done { color: #3a4a60; text-decoration: line-through; }
        @media (max-width: 600px) { .desktop-only { display: none !important; } .row { padding: 10px 10px; } }
        @keyframes in { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }
        .anim { animation: in .25s ease both; }
      `}</style>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 14px 60px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 6 }}>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "clamp(22px,5vw,34px)", color: "#c8d4e8", letterSpacing: "-0.5px", lineHeight: 1 }}>
              Tushar Sharma Sheet
            </h1>
             <span style={{ fontFamily: "'DM Mono'", fontSize: 11, color: "#d4dbe8", letterSpacing: "2px" }}>TRACKER</span>
            <a href="https://www.linkedin.com/in/tushar-sharma-702069305/" target="_blank" rel="noopener noreferrer" style={{ color: "#d4dbe8", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
           
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ fontSize: 11, color: "#d4dbe8" }}>{total} problems</span>
            <div style={{ display: "flex", gap: 18 }}>
              <span style={{ fontSize: 13, color: "#3fb77a" }}><b style={{ fontFamily: "'Inter'", fontWeight: 700, fontSize: 20 }}>{solved}</b> <span style={{ color: "#d4dbe8", fontSize: 11 }}>solved</span></span>
              <span style={{ fontSize: 13, color: "#4e6280" }}><b style={{ fontFamily: "'Inter'", fontWeight: 700, fontSize: 20 }}>{total - solved}</b> <span style={{ color: "#d4dbe8", fontSize: 11 }}>left</span></span>
              <span style={{ fontSize: 13, color: "#6b9bd2" }}><b style={{ fontFamily: "'Inter'", fontWeight: 700, fontSize: 20 }}>{pct}%</b></span>
            </div>
          </div>
          <div className="pbar"><div className="pfill" style={{ width: `${pct}%` }} /></div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button className={`tab-btn${tab === "problems" ? " active" : ""}`} onClick={() => setTab("problems")}>PROBLEMS</button>
          <button className={`tab-btn${tab === "stats" ? " active" : ""}`} onClick={() => setTab("stats")}>📊 STATS</button>
        </div>

        {/* ── Stats Tab ── */}
        {tab === "stats" && (
          <div className="anim">
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Problems", val: total, color: "#60a5fa" },
                { label: "Solved", val: solved, color: "#22c55e" },
                { label: "Remaining", val: total - solved, color: "#f87171" },
                { label: "Completion", val: pct + "%", color: "#fbbf24" },
                { label: "Topics Covered", val: topicStats.filter(t => t.done > 0).length + "/" + topicStats.length, color: "#c084fc" },
                { label: "With Notes", val: Object.values(state).filter(v => v?.note).length, color: "#a78bfa" },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: "#181d28", border: "1px solid #1c2130", borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: "#d4dbe8", letterSpacing: 1, marginBottom: 6 }}>{label.toUpperCase()}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, color, fontWeight: 700 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Topic breakdown */}
            <div style={{ fontSize: 10, color: "#d4dbe8", letterSpacing: 2, marginBottom: 10 }}>TOPIC BREAKDOWN</div>
            <div style={{ border: "1px solid #1c2130", borderRadius: 8, overflow: "hidden", background: "#161b24" }}>
              {topicStats.map(({ topic, total: t, done, pct: tp }) => {
                const ts = getStyle(topic);
                return (
                  <div key={topic} className="stat-row">
                    <span style={{ minWidth: 130, fontSize: 11, color: ts.text }}>{topic}</span>
                    <div className="stat-bar-outer">
                      <div className="stat-bar-inner" style={{ width: `${tp}%`, background: `linear-gradient(90deg, ${ts.border}, ${ts.text})` }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#d4dbe8", minWidth: 60, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {done}/{t} <span style={{ color: tp === 100 ? "#22c55e" : "#60a5fa" }}>({tp}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Recently solved */}
            <div style={{ fontSize: 10, color: "#d4dbe8", letterSpacing: 2, marginTop: 24, marginBottom: 10 }}>SOLVED PROBLEMS</div>
            <div style={{ border: "1px solid #1c2130", borderRadius: 8, overflow: "hidden", background: "#161b24" }}>
              {PROBLEMS.filter(p => state[p.id]?.done).length === 0
                ? <div style={{ padding: "32px 20px", textAlign: "center", color: "#d4dbe8", fontSize: 13 }}>no problems solved yet</div>
                : PROBLEMS.filter(p => state[p.id]?.done).slice(0, 50).map(p => {
                  const ts = getStyle(p.topic);
                  return (
                    <div key={p.id} className="stat-row">
                      <span style={{ fontSize: 10, color: "#22c55e", marginRight: 4 }}>✓</span>
                      <span style={{ fontSize: 10, color: "#d4dbe8", minWidth: 34 }}>#{p.num}</span>
                      <span style={{ flex: 1, fontSize: 12, color: "#8fa8bf" }}>{p.name}</span>
                      <span className="chip" style={{ background: ts.bg, borderColor: ts.border, color: ts.text }}>{p.topic}</span>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

        {/* ── Problems Tab ── */}
        {tab === "problems" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <input type="text" placeholder="search by name or number…" value={search} onChange={e => setSearch(e.target.value)} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {[["all","All"], ["todo","Todo"], ["done","Solved"]].map(([v, l]) => (
                  <button key={v} className={`filter-btn${statusFilter === v ? " active" : ""}`} onClick={() => setStatusFilter(v)}>{l}</button>
                ))}
                <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)}>
                  <option value="all">All Topics</option>
                  {ALL_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{ fontSize: 11, color: "#2e4060", marginLeft: "auto" }}>{visible.length} shown</span>
              </div>
            </div>

            <div style={{ border: "1px solid #1c2130", borderRadius: 8, overflow: "hidden", background: "#161b24" }}>
              {visible.length === 0 && (
                <div style={{ padding: "48px 20px", textAlign: "center", color: "#2e4060", fontSize: 13 }}>no problems match</div>
              )}
              {visible.map((p, i) => {
                const done = !!state[p.id]?.done;
                const hasNote = !!state[p.id]?.note;
                const ts = getStyle(p.topic);
                return (
                  <div key={p.id} className={`row${done ? " is-done" : ""} anim`} style={{ animationDelay: `${Math.min(i * 0.015, 0.3)}s` }}>
                    <button className={`cb${done ? " checked" : ""}`} onClick={() => toggle(p.id)} title="toggle done">
                      {done && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#22c55e" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: "#d4dbe8", fontVariantNumeric: "tabular-nums", minWidth: 34 }}>#{p.num}</span>
                        <span className={`prob-name${done ? " done" : ""}`}>{p.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        <span className="chip" style={{ background: ts.bg, borderColor: ts.border, color: ts.text }}>{p.topic}</span>
                        {hasNote && <span className="chip" style={{ background: "#15001a", borderColor: "#4c1d95", color: "#a78bfa" }}>note</span>}
                      </div>
                      {state[p.id]?.note && (
                        <div style={{ marginTop: 7, fontSize: 11, color: "#d4dbe8", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", borderLeft: "2px solid #1c2130", paddingLeft: 10 }}>
                          {state[p.id].note}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center", paddingTop: 1 }}>
                      <a href={`https://leetcode.com/problems/${p.slug.replace(/-\d+$/, '')}/`} target="_blank" rel="noopener noreferrer" className="btn btn-lc" title="Open on LeetCode">
                        LC <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 7L7 1M7 1H3M7 1v4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>
                      </a>
                      <button className={`btn btn-note${hasNote ? " has-note" : ""}`} onClick={() => openNote(p)} title="Add note">✎</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {noteModal && (
        <div className="modal-bg" onClick={() => setNoteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 10, color: "#d4dbe8", marginBottom: 4, letterSpacing: 1 }}>NOTE</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: "#c8d4e8", marginBottom: 14, lineHeight: 1.4 }}>
              #{noteModal.num} — {noteModal.name}
            </div>
            <textarea ref={textRef} rows={7} value={noteDraft} onChange={e => setNoteDraft(e.target.value)} placeholder="approach, complexity, key insight, gotchas…" />
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <button className="btn filter-btn" onClick={() => setNoteModal(null)}>cancel</button>
              <button className="btn filter-btn active" style={{ background: "#182540", borderColor: "#2e4060", color: "#6b9bd2" }} onClick={saveNote}>save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
