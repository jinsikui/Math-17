# 实作正 17 边形

## 一、分组

:::bg
按照高斯的步骤，我们首先选择一个 17 的原根 $g = 3$，按照原根的幂次给除了 1 以外的 16 个本原单位根排序和分组，相同的颜色代表分在同一组中：

$\zeta^{g^0}$ $\zeta^{g^1}$ $\zeta^{g^2}$ $\zeta^{g^3}$ $\zeta^{g^4}$ $\zeta^{g^5}$ $\zeta^{g^6}$ $\zeta^{g^7}$ $\zeta^{g^8}$ $\zeta^{g^9}$ $\zeta^{g^{10}}$ $\zeta^{g^{11}}$ $\zeta^{g^{12}}$ $\zeta^{g^{13}}$ $\zeta^{g^{14}}$ $\zeta^{g^{15}}$
$e = 1$
$\zeta^1$ $\zeta^3$ $\zeta^9$ $\zeta^{10}$ $\zeta^{13}$ $\zeta^5$ $\zeta^{15}$ $\zeta^{11}$ $\zeta^{16}$ $\zeta^{14}$ $\zeta^8$ $\zeta^7$ $\zeta^4$ $\zeta^{12}$ $\zeta^2$ $\zeta^6$

$e = 2$&nbsp;&nbsp;&nbsp;&nbsp;($P_0$，${\color{red}P_1}$)

$\zeta^1$ ${\color{red}\zeta^3}$ $\zeta^9$ ${\color{red}\zeta^{10}}$ $\zeta^{13}$ ${\color{red}\zeta^5}$ $\zeta^{15}$ ${\color{red}\zeta^{11}}$ $\zeta^{16}$ ${\color{red}\zeta^{14}}$ $\zeta^8$ ${\color{red}\zeta^7}$ $\zeta^4$ ${\color{red}\zeta^{12}}$ $\zeta^2$ ${\color{red}\zeta^6}$

$e = 4$&nbsp;&nbsp;&nbsp;&nbsp;($Q_0$，${\color{red}Q_1}$，${\color{blue}Q_2}$，${\color{green}Q_3}$)&nbsp;&nbsp;&nbsp;&nbsp;$P_0 = Q_0 + {\color{blue}Q_2}$，$P_1 = {\color{red}Q_1} + {\color{green}Q_3}$

$\zeta^1$ ${\color{red}\zeta^3}$ ${\color{blue}\zeta^9}$ ${\color{green}\zeta^{10}}$ $\zeta^{13}$ ${\color{red}\zeta^5}$ ${\color{blue}\zeta^{15}}$ ${\color{green}\zeta^{11}}$ $\zeta^{16}$ ${\color{red}\zeta^{14}}$ ${\color{blue}\zeta^8}$ ${\color{green}\zeta^7}$ $\zeta^4$ ${\color{red}\zeta^{12}}$ ${\color{blue}\zeta^2}$ ${\color{green}\zeta^6}$
$e = 8$
$\zeta^1$ ${\color{red}\zeta^3}$ ${\color{blue}\zeta^9}$ ${\color{green}\zeta^{10}}$ ${\color{purple}\zeta^{13}}$ ${\color{#D9A000}\zeta^5}$ ${\color{brown}\zeta^{15}}$ ${\color{hotpink}\zeta^{11}}$ $\zeta^{16}$ ${\color{red}\zeta^{14}}$ ${\color{blue}\zeta^8}$ ${\color{green}\zeta^7}$ ${\color{purple}\zeta^4}$ ${\color{#D9A000}\zeta^{12}}$ ${\color{brown}\zeta^2}$ ${\color{hotpink}\zeta^6}$

我们为 $e = 8$ 这一层（每组 2 个元素）补充上组名，按照相同的拆分规则，它们被命名为 $R_0$ 到 $R_7$。其中我们最关心的是包含 $\zeta^1$ 的 $R_0$ 组：
$R_0 = \zeta^1 + \zeta^{16}$
$R_4 = \zeta^{13} + \zeta^4$
上一层的 $Q_0$ 正好是由它们合并而成的：$Q_0 = R_0 + R_4$。
下面我们自顶向下，依次建立二次方程并求解。
:::

## 二、求解

### 1. 第一层拆分：求解 $P_0$ 和 $P_1$
:::bg
在 $e=2$ 这一层，所有的 16 个本原单位根被分为了 $P_0$ 和 $P_1$ 两组，每组 8 个元素。
根据上一章的结论，所有本原根之和为 $-1$，所以：

$P_0 + P_1 = -1$

接下来计算它们的乘积 $P_0 \times P_1$。
根据多项式乘法，这两组相乘会产生 $8 \times 8 = 64$ 个项。根据我们上一章证明的“代数对称性”（性质2、3），这 64 个项必然能完美还原成上层已知组的正整数倍线性组合，而上层只有一组，所以必然是所有根出现相同的次数，因为 $64 \div 16 = 4$，所以 64 项之和一定是所有本原单位根之和的 4 倍，即:

$P_0 \times P_1 = 4(\zeta^1 + \zeta^2 + \cdots + \zeta^{16}) = 4(-1) = -4$

现在，我们得到了一个完美的二次方程：

$X^2 + X - 4 = 0$

根据求根公式，解得 $X = \frac{-1 \pm \sqrt{17}}{2}$。因为 $P_0$ 中包含了 $2\cos(\frac{2\pi}{17})$ 这样较大的正数，通过简单的数值估算可知 $P_0 > P_1$，所以我们取正根：

$P_0 = \frac{-1 + \sqrt{17}}{2}$

$P_1 = \frac{-1 - \sqrt{17}}{2}$
:::

### 2. 第二层拆分：求解 $Q_0$ 和 $Q_1$

:::bg
在 $e = 4$ 这一层，我们要把 $P_0$ 拆分为 $Q_0$ 和 $Q_2$。
已知：

$Q_0 + Q_2 = P_0$

计算它们的乘积：$Q_0 = (\zeta^1 + \zeta^{13} + \zeta^{16} + \zeta^4)$， $Q_2 = (\zeta^9 + \zeta^{15} + \zeta^8 + \zeta^2)$。它们相乘产生 16 项，指数相加后（模 17），恰好不重不漏地构成了 $1 \sim 16$ 各一次！因此：

$Q_0 \times Q_2 = \zeta^1 + \zeta^2 + \cdots + \zeta^{16} = -1$

构造二次方程：

$X^2 - P_0 X - 1 = 0$

由于 $Q_0$ 包含 $\zeta^1$，估算 $Q_0 > Q_2$，取正根：

$Q_0 = \frac{P_0 + \sqrt{P_0^2 + 4}}{2}$

同理，对于 $P_1$ 拆分出来的 $Q_1$ 和 $Q_3$，也有 $Q_1 + Q_3 = P_1$ 且 $Q_1 \times Q_3 = -1$。我们同样解得：

$Q_1 = \frac{P_1 + \sqrt{P_1^2 + 4}}{2}$

代入第一步求出的 $P_0$ 和 $P_1$：

$Q_0 = \frac{-1 + \sqrt{17} + \sqrt{34 - 2\sqrt{17}}}{4}$

$Q_1 = \frac{-1 - \sqrt{17} + \sqrt{34 + 2\sqrt{17}}}{4}$
:::

### 3. 第三层拆分：求解 $R_0$

:::bg
这是最激动人心的一步。在 $e = 8$ 这一层，$Q_0$ 被拆分为了 $R_0$ 和 $R_4$。已知：

$R_0 + R_4 = Q_0$

我们来计算它们的乘积 $R_0 \times R_4$：

$(\zeta^1 + \zeta^{16}) \times (\zeta^{13} + \zeta^4) = \zeta^{14} + \zeta^5 + \zeta^{12} + \zeta^3$

这 4 个项加起来是什么？请回头看一眼前面的分组结果，它恰好就是 $Q_1$！因此：

$R_0 \times R_4 = Q_1$

构造出最后一个二次方程：

$X^2 - Q_0 X + Q_1 = 0$

因为 $R_0 = \zeta^1 + \zeta^{16} = 2\cos(\frac{2\pi}{17})$，这是正十七边形中心角对应的长度，估算 $R_0 > R_4$。我们取正根：

$R_0 = \frac{Q_0 + \sqrt{Q_0^2 - 4Q_1}}{2}$
:::

### 4. 走向终点的最简表达式

:::bg
我们离真相只差最后一步了。因为

$R_0 = \zeta^1 + \zeta^{-1} = 2\cos(\frac{2\pi}{17})$

所以，正十七边形作图的核心坐标值，就是：

$\cos\left(\frac{2\pi}{17}\right) = \frac{R_0}{2} = \frac{Q_0 + \sqrt{Q_0^2 - 4Q_1}}{4}$

我们将前面得到的 $Q_0$ 和 $Q_1$ 的精确表达式代入其中。经过一些代数上的整理（将分母统一提取为 16），就得到了最终的表达式：

$\cos\left(\frac{2\pi}{17}\right) = -\frac{1}{16} + \frac{\sqrt{17}}{16} + \frac{\sqrt{34 - 2\sqrt{17}}}{16} + \frac{1}{8}\sqrt{17 + 3\sqrt{17} - \sqrt{34 - 2\sqrt{17}} - 2\sqrt{34 + 2\sqrt{17}}}$
:::

## 四、实作正 5 边形

:::bg
$5 = 2^2 + 1$ 也是一个费马素数，它的求解过程相对短小精悍，可以再演示一次。我们的目标是求解 $\cos(\frac{2\pi}{5}) = \cos(72^\circ)$
:::

### 1. 寻找原根和分组

:::bg
对于正五边形，费马素数 $p = 5$
除 1 以外的 4 个本原单位根为：$\zeta, \zeta^2, \zeta^3, \zeta^4$。
我们寻找模 5 的原根，发现 $g=2$ 满足条件：
$2^0 \equiv 1 \pmod 5$
$2^1 \equiv 2 \pmod 5$
$2^2 \equiv 4 \pmod 5$
$2^3 \equiv 3 \pmod 5$

我们将本原单位根按照原根 $g=2$ 的幂次顺序排列，并进行分组：
$e = 1$
$\zeta^1$ $\zeta^2$ $\zeta^4$ $\zeta^3$
$e=2 \quad (P_0, {\color{red}P_1})$
$\zeta^1$ ${\color{red}\zeta^2}$ $\zeta^4$ ${\color{red}\zeta^3}$

可以看到，4 个根被完美分成了两组：
$P_0 = \zeta^1 + \zeta^4$
$P_1 = \zeta^2 + \zeta^3$
:::

### 2. 计算和与积

:::bg
$x^5 - 1 = (x - 1)(x^4 + x^3 + x^2 + x + 1) = (x - 1)(x - \zeta^1)(x - \zeta^2)(x - \zeta^3)(x - \zeta^4)$
两边约去 $(x - 1)$:
$x^4 + x^3 + x^2 + x + 1 = (x - \zeta^1)(x - \zeta^2)(x - \zeta^3)(x - \zeta^4)$
比较 $x^3$ 项的系数知:
$\zeta^1 + \zeta^2 + \zeta^3 + \zeta^4 = -1$
即所有本原单位根之和为 $-1$，所以：

$P_0 + P_1 = -1$

接下来计算这两组的乘积 $P_0 \times P_1$：

$P_0 \times P_1 = (\zeta^1 + \zeta^4)(\zeta^2 + \zeta^3)$

展开得到：

$P_0 \times P_1 = \zeta^3 + \zeta^4 + \zeta^6 + \zeta^7$

因为 $\zeta^5 = 1$，所以 $\zeta^6 = \zeta^1$，$\zeta^7 = \zeta^2$。代入后得到：

$P_0 \times P_1 = \zeta^3 + \zeta^4 + \zeta^1 + \zeta^2 = -1$
:::

### 3. 构造方程与求解

:::bg
现在我们有了和与积，直接构造二次方程：

$X^2 - (P_0 + P_1)X + (P_0 \times P_1) = 0$

$X^2 + X - 1 = 0$

使用求根公式解得：

$X = \frac{-1 \pm \sqrt{5}}{2}$

因为 $P_0 = \zeta^1 + \zeta^4 = \zeta^1 + \zeta^{-1} = 2\cos(\frac{2\pi}{5}) = 2\cos(72^\circ) > 0$。我们取正根：

$P_0 = \frac{-1 + \sqrt{5}}{2}$

由于 $\cos(\frac{2\pi}{5}) = \frac{P_0}{2}$，我们直接得出：

$\cos\left(\frac{2\pi}{5}\right) = \frac{-1 + \sqrt{5}}{4}$

仅仅只用了一次拆分、解了一个二次方程，我们就严谨地得出了 $\cos(72^\circ)$ 的精确根式。
:::