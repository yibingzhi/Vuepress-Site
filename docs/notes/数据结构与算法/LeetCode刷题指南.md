---
tags:
  - 数据结构
  - 算法
  - LeetCode
  - 刷题
  - 编程基础
title: LeetCode刷题指南
createTime: 2025/08/16 17:18:29
permalink: /article/xk7d89e3/
---
S

# LeetCode刷题指南

## 刷题策略

### 1. 刷题顺序建议

- **初级**：数组、字符串、链表基础操作
- **中级**：树、动态规划、贪心算法
- **高级**：图论、高级数据结构、数学

### 2. 每日刷题计划

- 每天2-3道题
- 先思考，再写代码
- 总结解题思路和技巧

### 3. 题目分类刷题

- 按类型集中刷题
- 掌握同类题目的解题模式
- 建立解题思维框架

## 数组与字符串

### 1. 两数之和（Two Sum）

#### 题目描述

给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出和为目标值 `target` 的那两个整数，并返回它们的数组下标。

#### 解题思路

- 使用HashMap存储已遍历的数字和索引
- 对于当前数字，查找 `target - current` 是否在HashMap中
- 时间复杂度：O(n)，空间复杂度：O(n)

#### Java实现

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            
            map.put(nums[i], i);
        }
        
        return new int[]{};
    }
}
```

### 2. 盛最多水的容器（Container With Most Water）

#### 题目描述

给定一个长度为 `n` 的整数数组 `height`。有 `n` 条垂线，第 `i` 条线的两个端点是 `(i, 0)` 和 `(i, height[i])`。找出其中的两条线，使得它们与
`x` 轴共同构成的容器可以容纳最多的水。

#### 解题思路

- 使用双指针法，从两端向中间移动
- 每次移动高度较小的指针
- 计算当前容器的面积并更新最大值

#### Java实现

```java
class Solution {
    public int maxArea(int[] height) {
        int left = 0;
        int right = height.length - 1;
        int maxArea = 0;
        
        while (left < right) {
            int width = right - left;
            int h = Math.min(height[left], height[right]);
            int area = width * h;
            
            maxArea = Math.max(maxArea, area);
            
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        
        return maxArea;
    }
}
```

### 3. 无重复字符的最长子串（Longest Substring Without Repeating Characters）

#### 题目描述

给定一个字符串 `s`，请你找出其中不含有重复字符的最长子串的长度。

#### 解题思路

- 使用滑动窗口法
- 用HashSet记录当前窗口中的字符
- 当遇到重复字符时，移动左指针

#### Java实现

```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        Set<Character> set = new HashSet<>();
        int left = 0;
        int maxLength = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char currentChar = s.charAt(right);
            
            while (set.contains(currentChar)) {
                set.remove(s.charAt(left));
                left++;
            }
            
            set.add(currentChar);
            maxLength = Math.max(maxLength, right - left + 1);
        }
        
        return maxLength;
    }
}
```

### 4. 最长回文子串（Longest Palindromic Substring）

#### 题目描述

给你一个字符串 `s`，找到 `s` 中最长的回文子串。

#### 解题思路

- 使用中心扩展法
- 对于每个位置，向两边扩展寻找回文
- 考虑奇数和偶数长度的回文

#### Java实现

```java
class Solution {
    public String longestPalindrome(String s) {
        if (s == null || s.length() < 2) {
            return s;
        }
        
        int start = 0;
        int maxLength = 1;
        
        for (int i = 0; i < s.length(); i++) {
            // 奇数长度回文
            int len1 = expandAroundCenter(s, i, i);
            // 偶数长度回文
            int len2 = expandAroundCenter(s, i, i + 1);
            
            int maxLen = Math.max(len1, len2);
            
            if (maxLen > maxLength) {
                maxLength = maxLen;
                start = i - (maxLen - 1) / 2;
            }
        }
        
        return s.substring(start, start + maxLength);
    }
    
    private int expandAroundCenter(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        
        return right - left - 1;
    }
}
```

## 链表

### 1. 反转链表（Reverse Linked List）

#### 题目描述

给你单链表的头节点 `head`，请你反转链表，并返回反转后的链表。

#### 解题思路

- 使用三个指针：prev、current、next
- 逐个反转节点的指向
- 时间复杂度：O(n)，空间复杂度：O(1)

#### Java实现

```java
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode current = head;
        
        while (current != null) {
            ListNode next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        
        return prev;
    }
}

// 递归版本
class Solution {
    public ListNode reverseList(ListNode head) {
        if (head == null || head.next == null) {
            return head;
        }
        
        ListNode newHead = reverseList(head.next);
        head.next.next = head;
        head.next = null;
        
        return newHead;
    }
}
```

### 2. 环形链表（Linked List Cycle）

#### 题目描述

给你一个链表的头节点 `head`，判断链表中是否有环。

#### 解题思路

- 使用快慢指针法
- 快指针每次走两步，慢指针每次走一步
- 如果有环，两个指针最终会相遇

#### Java实现

```java
public class Solution {
    public boolean hasCycle(ListNode head) {
        if (head == null || head.next == null) {
            return false;
        }
        
        ListNode slow = head;
        ListNode fast = head.next;
        
        while (slow != fast) {
            if (fast == null || fast.next == null) {
                return false;
            }
            
            slow = slow.next;
            fast = fast.next.next;
        }
        
        return true;
    }
}
```

### 3. 合并两个有序链表（Merge Two Sorted Lists）

#### 题目描述

将两个升序链表合并为一个新的升序链表并返回。

#### 解题思路

- 比较两个链表的当前节点
- 选择较小的节点连接到结果链表
- 移动对应的指针

#### Java实现

```java
class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode current = dummy;
        
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                current.next = l1;
                l1 = l1.next;
            } else {
                current.next = l2;
                l2 = l2.next;
            }
            current = current.next;
        }
        
        // 连接剩余节点
        current.next = (l1 != null) ? l1 : l2;
        
        return dummy.next;
    }
}
```

## 树

### 1. 二叉树的最大深度（Maximum Depth of Binary Tree）

#### 题目描述

给定一个二叉树，找出其最大深度。

#### 解题思路

- 使用递归法
- 最大深度 = max(左子树深度, 右子树深度) + 1
- 时间复杂度：O(n)，空间复杂度：O(h)

#### Java实现

```java
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        
        int leftDepth = maxDepth(root.left);
        int rightDepth = maxDepth(root.right);
        
        return Math.max(leftDepth, rightDepth) + 1;
    }
}

// 迭代版本（层序遍历）
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int depth = 0;
        
        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                
                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }
            
            depth++;
        }
        
        return depth;
    }
}
```

### 2. 对称二叉树（Symmetric Tree）

#### 题目描述

给定一个二叉树，检查它是否是镜像对称的。

#### 解题思路

- 递归比较左右子树
- 左子树的左节点与右子树的右节点比较
- 左子树的右节点与右子树的左节点比较

#### Java实现

```java
class Solution {
    public boolean isSymmetric(TreeNode root) {
        if (root == null) {
            return true;
        }
        
        return isMirror(root.left, root.right);
    }
    
    private boolean isMirror(TreeNode left, TreeNode right) {
        if (left == null && right == null) {
            return true;
        }
        
        if (left == null || right == null) {
            return false;
        }
        
        return (left.val == right.val) &&
               isMirror(left.left, right.right) &&
               isMirror(left.right, right.left);
    }
}
```

### 3. 二叉树的层序遍历（Binary Tree Level Order Traversal）

#### 题目描述

给你二叉树的根节点 `root`，返回其节点值的层序遍历。

#### 解题思路

- 使用队列进行层序遍历
- 记录每层的节点数量
- 将每层的节点值添加到结果中

#### Java实现

```java
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        
        if (root == null) {
            return result;
        }
        
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        
        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            List<Integer> currentLevel = new ArrayList<>();
            
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                currentLevel.add(node.val);
                
                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }
            
            result.add(currentLevel);
        }
        
        return result;
    }
}
```

## 动态规划

### 1. 爬楼梯（Climbing Stairs）

#### 题目描述

假设你正在爬楼梯。需要 `n` 阶你才能到达楼顶。每次你可以爬 `1` 或 `2` 个台阶。你有多少种不同的方法可以爬到楼顶呢？

#### 解题思路

- 动态规划：dp[i] = dp[i-1] + dp[i-2]
- 空间优化：只需要保存前两个状态
- 时间复杂度：O(n)，空间复杂度：O(1)

#### Java实现

```java
class Solution {
    public int climbStairs(int n) {
        if (n <= 2) {
            return n;
        }
        
        int prev1 = 1;
        int prev2 = 2;
        
        for (int i = 3; i <= n; i++) {
            int current = prev1 + prev2;
            prev1 = prev2;
            prev2 = current;
        }
        
        return prev2;
    }
}
```

### 2. 最大子数组和（Maximum Subarray）

#### 题目描述

给你一个整数数组 `nums`，请你找出一个具有最大和的连续子数组，返回其最大和。

#### 解题思路

- 动态规划：dp[i] = max(nums[i], dp[i-1] + nums[i])
- 空间优化：只需要保存前一个状态
- 时间复杂度：O(n)，空间复杂度：O(1)

#### Java实现

```java
class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = nums[0];
        int currentSum = nums[0];
        
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        
        return maxSum;
    }
}
```

### 3. 零钱兑换（Coin Change）

#### 题目描述

给你一个整数数组 `coins`，表示不同面额的硬币；以及一个整数 `amount`，表示总金额。计算并返回可以凑成总金额所需的最少的硬币个数。

#### 解题思路

- 动态规划：dp[i] = min(dp[i-coin] + 1) for all coins
- 初始化：dp[0] = 0，其他为无穷大
- 时间复杂度：O(amount * coins.length)

#### Java实现

```java
class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        
        return dp[amount] > amount ? -1 : dp[amount];
    }
}
```

## 贪心算法

### 1. 买卖股票的最佳时机（Best Time to Buy and Sell Stock）

#### 题目描述

给定一个数组 `prices`，它的第 `i` 个元素 `prices[i]` 表示一支给定股票第 `i` 天的价格。你只能选择某一天买入这只股票，并选择在未来的某一个不同的日子卖出该股票。

#### 解题思路

- 贪心算法：维护最小价格和最大利润
- 遍历数组，更新最小价格和最大利润
- 时间复杂度：O(n)，空间复杂度：O(1)

#### Java实现

```java
class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        
        for (int price : prices) {
            minPrice = Math.min(minPrice, price);
            maxProfit = Math.max(maxProfit, price - minPrice);
        }
        
        return maxProfit;
    }
}
```

### 2. 跳跃游戏（Jump Game）

#### 题目描述

给定一个非负整数数组 `nums`，你最初位于数组的第一个下标。数组中的每个元素代表你在该位置可以跳跃的最大长度。判断你是否能够到达最后一个下标。

#### 解题思路

- 贪心算法：维护最远可达位置
- 遍历数组，更新最远可达位置
- 如果当前位置超出最远可达位置，返回false

#### Java实现

```java
class Solution {
    public boolean canJump(int[] nums) {
        int maxReach = 0;
        
        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) {
                return false;
            }
            
            maxReach = Math.max(maxReach, i + nums[i]);
            
            if (maxReach >= nums.length - 1) {
                return true;
            }
        }
        
        return true;
    }
}
```

## 回溯算法

### 1. 全排列（Permutations）

#### 题目描述

给定一个不含重复数字的数组 `nums`，返回其所有可能的全排列。

#### 解题思路

- 回溯算法：使用交换法生成排列
- 递归生成所有可能的排列
- 时间复杂度：O(n!)，空间复杂度：O(n)

#### Java实现

```java
class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, result);
        return result;
    }
    
    private void backtrack(int[] nums, int start, List<List<Integer>> result) {
        if (start == nums.length) {
            List<Integer> permutation = new ArrayList<>();
            for (int num : nums) {
                permutation.add(num);
            }
            result.add(permutation);
            return;
        }
        
        for (int i = start; i < nums.length; i++) {
            swap(nums, start, i);
            backtrack(nums, start + 1, result);
            swap(nums, start, i);
        }
    }
    
    private void swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }
}
```

### 2. 子集（Subsets）

#### 题目描述

给你一个整数数组 `nums`，数组中的元素互不相同。返回该数组所有可能的子集。

#### 解题思路

- 回溯算法：每个元素可以选择或不选择
- 递归生成所有可能的子集
- 时间复杂度：O(2^n)，空间复杂度：O(n)

#### Java实现

```java
class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }
    
    private void backtrack(int[] nums, int start, List<Integer> current, List<List<Integer>> result) {
        result.add(new ArrayList<>(current));
        
        for (int i = start; i < nums.length; i++) {
            current.add(nums[i]);
            backtrack(nums, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }
}
```

## 图论

### 1. 岛屿数量（Number of Islands）

#### 题目描述

给你一个由 `'1'`（陆地）和 `'0'`（水）组成的的二维网格，请你计算网格中岛屿的数量。

#### 解题思路

- DFS或BFS遍历连通区域
- 访问过的陆地标记为水
- 时间复杂度：O(m*n)，空间复杂度：O(m*n)

#### Java实现

```java
class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) {
            return 0;
        }
        
        int count = 0;
        int rows = grid.length;
        int cols = grid[0].length;
        
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (grid[i][j] == '1') {
                    count++;
                    dfs(grid, i, j);
                }
            }
        }
        
        return count;
    }
    
    private void dfs(char[][] grid, int row, int col) {
        int rows = grid.length;
        int cols = grid[0].length;
        
        if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col] == '0') {
            return;
        }
        
        grid[row][col] = '0';
        
        dfs(grid, row - 1, col);
        dfs(grid, row + 1, col);
        dfs(grid, row, col - 1);
        dfs(grid, row, col + 1);
    }
}
```

## 刷题技巧

### 1. 解题步骤

```java
// 1. 理解题目
// 2. 设计算法
// 3. 编写代码
// 4. 测试用例
// 5. 优化代码
```

### 2. 常见优化技巧

```java
// 空间优化
public int optimizedSolution(int[] nums) {
    // 使用常数空间而不是数组
    int prev = 0;
    int current = 0;
    
    for (int num : nums) {
        int temp = current;
        current = Math.max(current, prev + num);
        prev = temp;
    }
    
    return current;
}

// 时间优化
public int timeOptimizedSolution(int[] nums) {
    // 使用HashMap避免重复计算
    Map<Integer, Integer> cache = new HashMap<>();
    
    for (int num : nums) {
        cache.put(num, cache.getOrDefault(num, 0) + 1);
    }
    
    return cache.size();
}
```

### 3. 调试技巧

```java
// 添加调试信息
public void debugSolution(int[] nums) {
    System.out.println("输入数组: " + Arrays.toString(nums));
    
    for (int i = 0; i < nums.length; i++) {
        System.out.println("处理索引 " + i + ", 值: " + nums[i]);
        // 处理逻辑
    }
    
    System.out.println("最终结果: " + result);
}
```

## 总结
