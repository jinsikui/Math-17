# 猜想和必要性证明（二）

## 5.1 主 $n$ 次单位根
回顾下这个图，下面我们研究 $\cos(\frac{2\pi}{n})$ 的性质
![两方面思路](necessity_routes.jpg)

数学上，三角函数和复数有着紧密的联系，具体的说：
- 任何一个复数都可以表示为“模长”乘以“单位向量”的形式
:::bg
$$a + bi = \sqrt{a^2 + b^2} \left(\cos\theta + i\sin\theta\right)$$
其中 $\theta$ 是 $a + bi$ 在复平面上和实轴的夹角，即幅角
:::
:::bg[fold=true foldTitle=收起证明 unfoldTitle=展开证明]
根据余弦定义
$$\cos\theta = \frac{a}{\sqrt{a^2 + b^2}}$$
$$\sin\theta = \frac{b}{\sqrt{a^2 + b^2}}$$
代入上面等式即可
:::
- 两个复数相乘，等于“模长相乘，夹角相加”
:::bg
$$(a + bi)(c + di) = \sqrt{a^2 + b^2}\sqrt{c^2 + d^2} \left\{\cos(\theta+\phi) + i\sin(\theta+\phi)\right\}$$
其中 $\theta$,$\phi$ 分别是 $a + bi$ 和 $c + di$ 在复平面上的幅角
:::
:::bg[fold=true foldTitle=收起证明 unfoldTitle=展开证明]
对于任意两个复数 $z_1 = a + bi$ 和 $z_2 = c + di$，我们在复平面上用模长和辐角来表示它们：
1. 对于 $z_1 = a + bi$：
设其模长为 $r_1 = \sqrt{a^2 + b^2}$，辐角为 $\theta$。
根据三角函数的定义，我们有：$a = r_1\cos\theta$，$b = r_1\sin\theta$。
所以 $z_1$ 可以重写为：$z_1 = r_1(\cos\theta + i\sin\theta)$。
2. 对于 $z_2 = c + di$：
设其模长为 $r_2 = \sqrt{c^2 + d^2}$，辐角为 $\phi$。
同理有：$c = r_2\cos\phi$，$d = r_2\sin\phi$。
所以 $z_2$ 可以重写为：$z_2 = r_2(\cos\phi + i\sin\phi)$。

严谨推导步骤
第一步：代入三角形式并进行代数展开
我们将两个复数的三角形式相乘：
$$(a + bi)(c + di) = \left[ r_1(\cos\theta + i\sin\theta) \right] \left[ r_2(\cos\phi + i\sin\phi) \right]$$
利用乘法交换律，先把模长 $r_1$ 和 $r_2$ 提出来相乘：
$$= r_1 r_2 \left[ (\cos\theta + i\sin\theta)(\cos\phi + i\sin\phi) \right]$$
接下来，对中括号内的两项进行标准的多项式乘法展开：
$$= r_1 r_2 \left[ \cos\theta\cos\phi + i\cos\theta\sin\phi + i\sin\theta\cos\phi + i^2\sin\theta\sin\phi \right]$$

第二步：利用 $i^2 = -1$ 分离实部与虚部
因为虚数单位的定义是 $i^2 = -1$，我们把式子里的 $i^2$ 替换掉，并把含有 $i$ 的项（虚部）和不含 $i$ 的项（实部）分别合并：
$$= r_1 r_2 \left[ (\cos\theta\cos\phi - \sin\theta\sin\phi) + i(\sin\theta\cos\phi + \cos\theta\sin\phi) \right]$$

第三步：调用三角函数和角公式
这里是证明最核心的一步。我们需要用到高中数学里极其基础的两个三角恒等式：
- 余弦的和角公式：$\cos(\theta + \phi) = \cos\theta\cos\phi - \sin\theta\sin\phi$
- 正弦的和角公式：$\sin(\theta + \phi) = \sin\theta\cos\phi + \cos\theta\sin\phi$

仔细观察第二步括号里的式子，实部完美对应余弦的和角公式，虚部完美对应正弦的和角公式！
我们将它们直接替换：
$$= r_1 r_2 \left[ \cos(\theta + \phi) + i\sin(\theta + \phi) \right]$$

第四步：代回模长的原始定义
最后，我们把 $r_1$ 和 $r_2$ 替换回它们一开始的代数定义：
$$r_1 = \sqrt{a^2 + b^2}$$
$$r_2 = \sqrt{c^2 + d^2}$$
代入式子，即得到最终结论：
$$(a + bi)(c + di) = \sqrt{a^2 + b^2}\sqrt{c^2 + d^2} \left\{ \cos(\theta+\phi) + i\sin(\theta+\phi) \right\}$$
Q.E.D. (证明完毕)
:::
- 正 $n$ 边形的圆心角是 $\frac{2\pi}{n}$，有下面等式
:::bg
令复数 $\zeta = \cos(\frac{2\pi}{n}) + i\sin(\frac{2\pi}{n})$&nbsp;&nbsp;&nbsp;&nbsp;**(定义5.1)**

$\zeta$ 的模 $|\zeta| = \sqrt{\cos^2(\frac{2\pi}{n}) + \sin^2(\frac{2\pi}{n})} = 1$, 因此 $\zeta$ 是一个单位向量，它和实轴的夹角就是 $\frac{2\pi}{n}$
:::
:::bg
$$\zeta^n = \underbrace{1 \times 1 \times \cdots \times 1}_{n \text{ 个 1}} \left\{\cos(\underbrace{\frac{2\pi}{n} + \cdots + \frac{2\pi}{n}}_{n \text{ 个}}) + i\sin(\underbrace{\frac{2\pi}{n} + \cdots + \frac{2\pi}{n}}_{n \text{ 个}})\right\}$$
$$= \cos(2\pi) + i\sin(2\pi) = 1 + i \cdot 0 = 1$$

由 $\zeta^n = 1$, $\zeta^n - 1 = 0$, 我们知道 $\zeta$ 是多项式 $p(x) = x^n - 1$ 在复数域的一个根&nbsp;&nbsp;&nbsp;&nbsp;**(命题5.1)**

$\zeta$ 有一个几何专属名：**「主 $n$ 次单位根 (Principal $n$-th root of unity)」**
:::
![复数运算](complex_numbers.jpg)
:::bg
注意到：
$$\frac{1}{\zeta} = \frac{1}{\cos(\frac{2\pi}{n}) + i\sin(\frac{2\pi}{n})} = \frac{\cos(\frac{2\pi}{n}) - i\sin(\frac{2\pi}{n})}{\left[\cos(\frac{2\pi}{n}) + i\sin(\frac{2\pi}{n})\right] \cdot \left[\cos(\frac{2\pi}{n}) - i\sin(\frac{2\pi}{n})\right]}$$

$$ = \frac{\cos(\frac{2\pi}{n}) - i\sin(\frac{2\pi}{n})}{\cos^2(\frac{2\pi}{n}) - i^2\sin^2(\frac{2\pi}{n})} = \frac{\cos(\frac{2\pi}{n}) - i\sin(\frac{2\pi}{n})}{\cos^2(\frac{2\pi}{n}) + \sin^2(\frac{2\pi}{n})} = \frac{\cos(\frac{2\pi}{n}) - i\sin(\frac{2\pi}{n})}{1}$$

$$ = \cos(\frac{2\pi}{n}) - i\sin(\frac{2\pi}{n})$$

因此:
$\zeta + \frac{1}{\zeta} = \left[\cos(\frac{2\pi}{n}) + i\sin(\frac{2\pi}{n})\right] + \left[\cos(\frac{2\pi}{n}) - i\sin(\frac{2\pi}{n})\right] = 2\cos(\frac{2\pi}{n})$

$\cos(\frac{2\pi}{n}) = \frac{1}{2}(\zeta + \frac{1}{\zeta})$

现在我们知道，$\cos(\frac{2\pi}{n})$ 和 $\zeta$ 可以相互表出：
- $\zeta = \cos(\frac{2\pi}{n}) + i\sin(\frac{2\pi}{n}) = \cos(\frac{2\pi}{n}) + i\sqrt{1 - \cos^2(\frac{2\pi}{n})}$&nbsp;&nbsp;&nbsp;&nbsp;**(命题5.2)**
- $\cos(\frac{2\pi}{n}) = \frac{1}{2}(\zeta + \frac{1}{\zeta})$&nbsp;&nbsp;&nbsp;&nbsp;**(命题5.3)**
:::
## 5.2 和数域理论建立联系

下面的推理是本教程最精彩的思维旅程之一

:::bg
在第4章中我们学习了数域和扩域理论。并且得出一个重要结论：尺规作图有限步开平方后，得到的数域的维数一定是 $2$ 的某次方（命题4.8）。那么如果 $\cos(\frac{2\pi}{n})$ 被尺规作出了，它被作出时当前的维数一定也是 $2$ 的次方。

假设 $A$ 是用尺作出 $\cos(\frac{2\pi}{n})$ 时生成的数域，即

$A = Q + \underbrace{\cdots\text{ }\cdots}_{\text{中间长度集合}S} + \left\{\cos(\frac{2\pi}{n})\right\}$&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.1)**&nbsp;&nbsp;&nbsp;&nbsp;(这里的"+"是扩域的意思)
:::
:::bg
根据之前的讨论，存在 $\ge 0$ 的整数 $k$ 使得

$d(A, Q) = 2^k$&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.2)**&nbsp;&nbsp;&nbsp;&nbsp;($d$ 代表维数函数，见命题4.7)。
:::
:::bg
现在我们做关键的一步，我们把 $\sin(\frac{2\pi}{n})$，复数 $i$，依次加入到数域 $A$ 中进行扩域 (这次不是尺规作图，是纯理论性的扩域)，最终得到数域 $K$。

$K = A + \left\{\sin(\frac{2\pi}{n})\right\} + \left\{i\right\}$&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.3)**
:::
:::bg
因为 $\zeta = \cos(\frac{2\pi}{n}) + i\sin(\frac{2\pi}{n})$，因此 $\zeta$ 也会自动包含在 $K$ 中。再由命题4.6，扩域的结果和加入的顺序无关，所以我们可以把后面那些数合到一个集合里写：

$K= Q + \underbrace{\cdots\text{ }\cdots}_{\text{中间长度集合}S} + \left\{\cos(\frac{2\pi}{n}), \sin(\frac{2\pi}{n}), i, \zeta\right\}$&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.4)**
:::
下面我们来计算 $K$ 的维数
:::bg
令 $B = A(\sin(\frac{2\pi}{n}))$

于是 $K = B(i)$

根据命题4.7（塔定理），我们有：

$d(K, Q) = d(A, Q) \times d(B, A) \times d(K, B)$&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.5)**
:::
:::bg
由(式 5.2)：$d(A, Q) = 2^k$
:::
:::bg
现在求 $d(B, A) = d(A(\sin(\frac{2\pi}{n}), A)$

由于 $\sin(\frac{2\pi}{n})$ 是多项式 $p(x) = x^2 + \cos^2(\frac{2\pi}{n}) - 1$ 的根，并且 $p(x)$ 中的系数 ($1$ 和 $\cos^2(\frac{2\pi}{n}) - 1$) 都在数域 $A$ 中，$p(x)$ 的次数是2，因此向 $A$ 中加入 $\sin(\frac{2\pi}{n})$ 后，由命题4.4可知:

$d(A(\sin(\frac{2\pi}{n})), A) = 2\text{ 或 }1$&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.6)**

(有可能等于 1 是因为由 $\cos(\frac{2\pi}{n})$ 得到 $\sin(\frac{2\pi}{n})$ 时不一定必然扩域，如 $\sin(\frac{2\pi}{4}) = \cos(\frac{2\pi}{4}) = \frac{\sqrt{2}}{2}$，或者我们在尺规作出 $\cos(\frac{2\pi}{n})$ 之前，可能已经作出了 $\sin(\frac{2\pi}{n})$。这些情况下 $\sin(\frac{2\pi}{n})$ 已经在 $A$ 中，再加入一次就不会发生扩域)
:::
:::bg
现在求 $d(K, B) = d(B(i), B)$

由于 $i$ 是多项式 $p(x) = x^2 + 1$ 的根，并且 $p(x)$ 中的系数 ($1$ 和 $1$) 都在数域 $B$ 中，$p(x)$ 的次数是2，因此再由命题4.4可知:

$d(B(i), B) = 2$&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.7)**

(这次不可能等于 1 是因为 $i$ 是我们第一次向数域中加入复数，$i$ 不可能在原来的数域中，因此一定会发生扩域)
:::
:::bg
将 (式 5.2) (式 5.6) (式 5.7) 代入 (式 5.5)，我们得到

$d(K, Q) = d(A, Q) \times d(B, A) \times d(K, B) = 2^k \times (2\text{ 或 1}) \times 2 = 2^{k_1}$&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.8)**
:::
下面我们换一种方式来构造 $K$，从而用另一种方式计算 $K$ 的维数：
:::bg
我们在有理数集 $Q$ 中，先加入 $\zeta$，由于 $\cos(\frac{2\pi}{n}) = \frac{1}{2}(\zeta + \frac{1}{\zeta})$&nbsp;&nbsp;(命题5.3)，这等价于又加入了 $\cos(\frac{2\pi}{n})$，然后再向其中加入 $\sin(\frac{2\pi}{n})$，由于 $i = \frac{\zeta - \cos(\frac{2\pi}{n}))}{\sin(\frac{2\pi}{n})}$，这等价于又加入了 $i$，最后我们再加入(式 5.1)中那些中间长度的集合 $S$：
:::
:::bg
$K = Q + \left\{\zeta\right\} + \left\{\sin(\frac{2\pi}{n})\right\} + \underbrace{\cdots\text{ }\cdots}_{\text{中间长度集合}S}$&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.9)**

$= Q + \left\{\zeta, \cos(\frac{2\pi}{n}), \sin(\frac{2\pi}{n}), i\right\} + \underbrace{\cdots\text{ }\cdots}_{\text{中间长度集合}S}$&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.10)**

回顾一下前面的 (式 5.4)：
$K= Q + \underbrace{\cdots\text{ }\cdots}_{\text{中间长度集合}S} + \left\{\cos(\frac{2\pi}{n}), \sin(\frac{2\pi}{n}), i, \zeta\right\}$&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.4)**

可见虽然加入的顺序不同，最后得到的是同一个数域 $K$
:::
下面我们按照 (式 5.9) 的顺序再次来求 $K$ 的维数
:::bg
令 $C = Q(\zeta)$

$D = C(\sin(\frac{2\pi}{n}))$

于是 $K = D(S)$

根据命题4.7（塔定理），我们有：

$d(K, Q) = d(C, Q) \times d(D, C) \times d(K, D)$&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.11)**
:::
:::bg
由于 $C$ 中包含了 $\cos(\frac{2\pi}{n})$，按照前面已经讨论过的思路我们知道：

$d(D, C) = d(C(\sin(\frac{2\pi}{n}), C) = 2\text{ 或 }1$&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.12)**
:::
:::bg
$d(K, D) = d(D(S), D)$

因为 $S$ 中的数都是尺规作图可以作出的长度，所以 $S$ 中每一个导致扩域的数都是开平方得到的数，这个数的最小多项式的次数只能是2或1，所以必然有：

$d(D(S), D) = 2^{k_2}$&nbsp;&nbsp;($k_2$ 是 $\ge 0$ 的整数)&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.13)**
:::
:::bg
最后只剩下求 $d(C, Q) = d(Q(\zeta), Q)$
根据命题4.4，$d(Q(\zeta), Q)$ 等于“以 $\zeta$ 为根，$Q$ 中数为系数的，最小多项式的次数”
我们已经知道的一个以 $\zeta$ 为根，$Q$ 中数为系数的多项式是： $p(x) = x^n - 1$&nbsp;&nbsp;(详见命题5.1)
但是，这个多项式是不是次数“最小”的多项式呢？答案是：不一定。
:::
:::bg
我们规定：以 $\zeta$ 为根，$Q$ 中数为系数的“最小”多项式为：**「$n$ 次分圆多项式」**
我们假设它的次数为 $p_n$。&nbsp;&nbsp;&nbsp;&nbsp;**(定义 5.2)**
:::
:::bg
于是 $d(C, Q) = d(Q(\zeta), Q) = p_n$&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.14)**

将 (式 5.12) (式 5.13) (式 5.14) 代入 (式 5.11)：

$d(K, Q) = p_n \times (2\text{ 或 }1) \times 2^{k_2} = p_n \times 2^{k_3}$&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.15)**

再和之前算出的 $K$ 的维数 (式 5.8) 建立等式：

$p_n \times 2^{k_3} = 2^{k_1}$

$p_n = 2^{k_4}$&nbsp;&nbsp;&nbsp;&nbsp;**(式 5.16)**

这就是我们苦苦寻找的“尺规可作正n边形”的“n”必须满足的条件（必要条件）。
虽然我们不知道 $k_4$ 的值是多少，但是我们知道 $p_n$ 一定是2的次方，这已经是很强的限制条件了。
从定义5.2来看，$p_n$ 和 $n$ 是强相关的。下一步我们就集中精力探索 $p_n$ 和 $n$ 的关系，从而得到 $n$ 的表达式。
:::

## 5.3 $n$ 次分圆多项式

说明：本小节的内容涉及比较多的背景知识。如果想严格看懂每一步推导过程，需要把「附录1」-「附录10」中的内容都学习一遍。不过即使不了解这些知识，将这些背景知识当作“已知事实”，相信依然能够大概看懂本节的内容。
:::bg
任务回顾：
我们现在要寻找以主单位根 $\zeta$ 为根的“最小次数有理多项式”，看看它的次数是什么，和 $n$ 是什么关系。我们用 $\Phi_n(x)$ 代表以 $\zeta$ 为根的最小多项式。
:::
我们首先看一下「最小多项式」有哪些通用的性质。
:::bg
性质1: 如果 $\Phi(x)$ 是它的任意一个根的最小多项式，那么 $\Phi(x)$ 一定是不可约的（在某个系数域中）&nbsp;&nbsp;&nbsp;&nbsp;**(命题5.4)**

关于“不可约”的定义详见「附录4」。
:::
:::bg[fold=true foldTitle=收起 unfoldTitle=展开证明性质1]
证明：如果 $\Phi(x)$ 可约，一定可以分解为两个次数更低的（且次数 $\ge 1$ 的）多项式的乘积，设 $\Phi(x) = p(x)q(x)$，设 $\alpha$ 是 $\Phi(x)$ 的一个根，由于 $\Phi(\alpha) = p(\alpha)q(\alpha) = 0$，一定有 $p(\alpha) = 0$ 或 $q(\alpha) = 0$，不妨设 $p(\alpha) = 0$，那么 $p(x)$ 就是一个以 $\alpha$ 为根的，次数比 $\Phi(x)$ 更低的多项式，这和 $\Phi(x)$ 是最小多项式矛盾。因此 $\Phi(x)$ 一定是不可约的。
:::
:::bg
性质2: 如果 $\Phi(x)$ 是以 $\alpha$ 为根的最小多项式，那么 $\Phi(x)$ 能够整除任意以 $\alpha$ 为根的多项式（在某个系数域中）&nbsp;&nbsp;&nbsp;&nbsp;**(命题5.5)**
:::
:::bg[fold=true foldTitle=收起 unfoldTitle=展开证明性质2]
证明：设 $P(x)$ 是任意一个以 $\alpha$ 为根的多项式，我们用 $P(x)$ 除以 $\Phi(x)$（多项式的带余除法详见「附录1」）：
$P(x) = Q(x)\Phi(x) + R(x)$
由带余除法的性质，$R(x)$ 或者为“0多项式”，或者次数一定小于 $\Phi(x)$。
将 $\alpha$ 代入:
$P(\alpha) = Q(\alpha)\Phi(\alpha) + R(\alpha)$
$0 = Q(\alpha)\cdot 0 + R(\alpha)$
$R(\alpha) = 0$
如果 $R(x)$ 不是“0多项式”，它就是一个次数比 $\Phi(x)$ 还小的以 $\alpha$ 为根的多项式，和假设矛盾。
因此 $R(x)$ 一定是“0多项式”，即 $\Phi(x)$ 能够整除 $P(x)$
:::
:::bg
性质3: 如果 $\Phi(x)$ 是它的一个根的最小多项式，那么它也是它其他根的最小多项式（在某个系数域中）&nbsp;&nbsp;&nbsp;&nbsp;**(命题5.6)**

设 $\Phi(x)$ 是以 $\alpha$ 为根的最小多项式，$\beta$ 是 $\Phi(x)$ 的另一个根，那么我们断言 $\Phi(x)$ 也是 $\beta$ 的最小多项式。
:::
:::bg[fold=true foldTitle=收起 unfoldTitle=展开证明性质3]
证明：使用反正法，假设 $\Phi(x)$ 以 $\beta$ 为根，但不是 $\beta$ 的最小多项式，那么假设 $\beta$ 的最小多项式是 $Q(x)$，根据命题5.5，$Q(x)$ 一定能整除 $\Phi(x)$。但是根据命题5.4，由于 $\Phi(x)$ 是另一个根 $\alpha$ 的最小多项式，那么 $\Phi(x)$ 是不可约的。$Q(x)$ 能整除一个不可约多项式，唯一的可能性就是 $Q(x)$ 等于 $\Phi(x)$ 的非零常数倍。所以 $\Phi(x)$ 就是 $\beta$ 的最小多项式。
:::
现在我们已经有了充分的工具，可以揭开 $\Phi_n(x)$ 的面纱了。
:::bg
根据代数基本定理（「附录9」），如果知道了一个多项式在复数域的全部根，就可以得到这个多项式了（只差一个常数系数），所以我们只要找到 $\Phi_n(x)$ 在复数域中的全部根即可得到 $\Phi_n(x)$。

我们先来看看 $\Phi_n(x)$ 的根的“候选人”。

因为 $\zeta$ 是 $x^n - 1$ 的根，那么根据「命题5.5」，$\Phi_n(x)$ 能整除 $x^n - 1$，即存在多项式 $Q(x)$ 使得：

$x^n - 1 = \Phi_n(x)\cdot Q(x)$

$x^n - 1$ 在复数域中的根只有 $n$ 个，就是复平面上单位圆上的 $n$ 个单位根：

$\{\zeta, \zeta^2, \cdots, \zeta^{n-1}, 1\}$

于是 $x^n - 1$ 作为复系数域中的多项式可以唯一分解为：$(x - \zeta)(x - \zeta^2)\cdots(x - \zeta^{n-1})(x - 1)$
根据多项式的「欧几里得引理」（见附录4），这 $n$ 个复系数域中的不可约因式「$x - \zeta^i$」，必然要逐一分配给 $\Phi_n(x)$ 和 $Q(x)$，其中分配给 $\Phi_n(x)$ 的项就对应着 $\Phi_n(x)$ 的根。也就是说，$\Phi_n(x)$ 在复数域的根，只能从 $\{\zeta, \zeta^2, \cdots, \zeta^{n-1}, 1\}$ 中取，而且不能有重根（因为 $x^n - 1$ 没有重因式）。
:::
![两方面思路](mini_poly_of_zeta.jpg)
:::bg
大胆猜测：
那么，分给 $\Phi_n(x)$ 的是哪些「$\zeta^i$」呢？我们知道，$\zeta = \zeta^1$ 是 $\Phi_n(x)$ 的根，那么我们不妨猜想一下，$\{\zeta, \zeta^2, \cdots, \zeta^{n-1}, 1\}$ 中有哪些和 $\zeta^1$ 是“同类”呢？
这 $n$ 个单位根是 $x^n = 1$ 的根，但是，其中有一些不仅是 $x^n = 1$ 的根，还有可能是比 $n$ 更小的 $k$ 的 $x^k = 1$ 的根。
例如，当 $n = 6$ 时，$\zeta^2$ 不仅是 $x^6 = 1$ 的根，还是 $x^3 = 1$ 的根（因为 $(\zeta^2)^3 = \zeta^6 = 1$）
这样的「$\zeta^i$」就显得不那么“纯粹”。我们大胆猜测，$\zeta^1$ 的“同类”只包括哪些 $i$ 和 $n$ 互素的 $\zeta^i$，只有这些才是 $\Phi_n(x)$ 的根
（$i$ 与 $n$ 互素保证了不存在比 $n$ 更小的 $k$ 使得 $(\zeta^i)^k = 1$）
:::
:::bg
小心求证：
已知：$\Phi_n(x)$ 是以 $\zeta$ 为根的最小多项式。求证：
(一) $\zeta^i$ 必然也是 $\Phi_n(x)$ 的根，其中 $i$ 和 $n$ 互素。
(二) $\zeta^i$ 必然不是 $\Phi_n(x)$ 的根，其中 $i$ 和 $n$ 不互素。
:::
:::bg[fold=true foldTitle=收起 unfoldTitle=展开证明（二）]
先证明 (二):
1. 假设 $\alpha = \zeta^m$ ($0 \leq m < n$) 是 $\Phi_n(x)$ 的一个根，并且 $\gcd(m, n) = d > 1$。我们希望推出矛盾。
2. $\alpha^{\frac{n}{d}} = (\zeta^m)^{\frac{n}{d}} = \zeta^{n \cdot \frac{m}{d}} = 1$。这意味着 $\alpha$ 是多项式 $x^{\frac{n}{d}} - 1$ 的根。
3. 根据「命题5.6」，因为 $\alpha$ 是 $\Phi_n(x)$ 的根，那么 $\Phi_n(x)$ 一定也是 $\alpha$ 的最小有理多项式，再根据「命题5.5」，$\Phi_n(x)$ 一定能整除 $x^{\frac{n}{d}} - 1$，因此存在有理多项式 $Q(x)$ 满足：$x^{\frac{n}{d}} - 1 = \Phi_n(x)Q(x)$
4. 因为已知 $\zeta$ 是 $\Phi_n(x)$ 的根，即 $\Phi_n(\zeta) = 0$，将 $\zeta$ 代入上式：
$\zeta^{\frac{n}{d}} - 1 = \Phi_n(\zeta)Q(\zeta) = 0\cdot Q(\zeta) = 0$
$\zeta^{\frac{n}{d}} = 1$
5. 发现矛盾：因为 $\zeta = \cos(\frac{2\pi}{n}) + i\sin(\frac{2\pi}{n})$ 是主单位根，它的 $\frac{n}{d}$ 次方不可能等于 $1$，这就与上面 $\zeta^{\frac{n}{d}} = 1$ 产生了矛盾。
6. 综上，假设不成立，我们证明了当 $m$ 与 $n$ 不互素时，$\zeta^m$ 不可能是 $\Phi_n(x)$ 的根。
:::
:::bg[fold=true foldTitle=收起 unfoldTitle=展开证明（一）]
再证明（一）：
我们要证明，当 $p$ 和 $n$ 互素时，$\zeta^p$ 必然是 $\Phi_n(x)$ 的根。

第一步：证明 $\Phi_n(x)$ 是整系数多项式
1. 因为 $\zeta^n = 1$，所以 $\zeta$ 是多项式 $x^n - 1$ 的一个根。根据「命题5.5」$\Phi_n(x)$ 一定能在有理数域中整除 $x^n - 1$。即存在有理多项式 $g(x)$ 使得 $x^n - 1 = \Phi_n(x)g(x)$
2. 因为 $x^n - 1$ 是一个“首一”的整系数多项式，根据高斯引理的推论（见「附录5」），$\Phi_n(x)$ 和 $g(x)$ 可通过乘以一个有理数缩放，都转化为“首一”的整系数多项式。后面的讨论会把 $\Phi_n(x)$ 和 $g(x)$ 都当作首一整系数多项式处理。因为系数都是整数，它们也可以看作是“模 $p$”下的多项式（见「附录6」）。

第二步：核心引理（素数次幂的提升）
引理：若 $\omega$ 是 $\Phi_n(x)$ 的根，且 $p$ 是一个不整除 $n$ 的素数，则 $\omega^p$ 也是 $\Phi_n(x)$ 的根。
反证法证明：
1. 假设 $\omega^p$ 不是 $\Phi_n(x)$ 的根。
2. 因为 $\omega$ 是 $\Phi_n(x)$ 的根，$x^n - 1 = \Phi_n(x)g(x)$，那么 $\omega$ 必定是 $x^n - 1$ 的根，$\omega^n = 1$。
3. 因为 $(\omega^p)^n = (\omega^n)^p = 1^p = 1$，所以 $\omega^p$ 必定是 $x^n - 1$ 的根。
4. 既然 $x^n - 1 = \Phi_n(x)g(x)$，且 $\omega^p$ 不是 $\Phi_n(x)$ 的根，那么 $\omega^p$ 必然是 $g(x)$ 的根，即 $g(\omega^p) = 0$。
5. 这意味着 $\omega$ 是多项式 $g(x^p)$ 的根。因为 $\Phi_n(x)$ 是 $\omega$ 的最小多项式（命题5.6），它必须整除任何以 $\omega$ 为根的多项式（命题5.5）。所以 $\Phi_n(x)$ 必然整除 $g(x^p)$。设 $g(x^p) = \Phi_n(x)h(x)$
6. 前面第一步中已经证明 $g(x)$ 和 $\Phi_n(x)$ 都是首一整系数多项式，那么 $g(x^p)$ 也是首一整系数多项式。根据高斯引理的推论（附录5），$h(x)$ 也是首一整系数多项式。
7. 现在，我们将 $g(x^p) = \Phi_n(x)h(x)$ 等式两边放到模素数 $p$ 下的多项式 $\mathbb{Z}_p[x]$ 中考察（给多项式加“上划线”表示模 $p$）：
$\overline{g}(x^p) = \overline{\Phi}_n(x)\overline{h}(x)$
8. 根据新生之梦定理（见附录6），我们有 $\overline{g}(x^p) = (\overline{g}(x))^p$。所以：
$(\overline{g}(x))^p = \overline{\Phi}_n(x)\overline{h}(x)$
9. 由唯一分解定理（附录4）可知，$\overline{\Phi}_n(x)$ 的不可约因式，一定也是 $\overline{g}(x)$ 的不可约因式（在 $\mathbb{Z}_p[x]$ 中），设 $\overline{k}(x)$ 是 $\overline{\Phi}_n(x)$ 和 $\overline{g}(x)$ 的一个公共不可约因式。
10. 既然 $x^n - 1 = \Phi_n(x)g(x)$，在模 $p$ 下就是 $x^n - 1 = \overline{\Phi}_n(x)\overline{g}(x)$。由于它们有公共因式 $\overline{k}(x)$，这意味着 $x^n - 1$ 在 $\mathbb{Z}_p[x]$ 中含有重因式 $\overline{k}(x)^2$。
11. 我们请出多项式重因式判定法和形式导数（见「附录8」）：
令 $\overline{f}(x) = x^n - 1$，其形式导数为 $\overline{f'}(x) = nx^{n-1}$。
将 $\overline{f'}(x)$ 唯一分解为不可约因式的乘积（见「附录4」），因式只能是：$x$。
而 $x$ 不是 $\overline{f}(x)$ 的因式
（因为通过带余除法用 $x$ 去除 $x^n - 1$，余数为 $-1 \equiv p-1 \pmod p$，余数不为 $0$） 
因此 $\gcd(\overline{f}, \overline{f'}) = 1$，根据「附录8」中的重因式判定法，$\overline{f}(x)$ 没有重因式。
12. 得出结论：第10步得出 $\overline{f}(x) = x^n - 1$ 有重因式 $\overline{k}(x)^2$，第11步判断 $\overline{f}(x)$ 没有重因式，矛盾。因此最初的假设不成立，即 $\omega^p$ 一定是 $\Phi_n(x)$ 的根。


第三步：推广到任意互素次幂
有了第二步的引理，我们就可以将“根的范围”扩大：
1. 已知主单位根 $\zeta$ 是 $\Phi_n(x)$ 的根（定义）。
2. 对于任意与 $n$ 互素的正整数 $k$，根据**算术基本定理（唯一分解定理）**，我们可以将其分解为素数的乘积：$k = p_1 p_2 \dots p_m$（这些素数可以重复，但都不整除 $n$）。
3. 连续使用第二步的引理：
- $\zeta$ 是根 $\implies \zeta^{p_1}$ 是根。
- $\zeta^{p_1}$ 是根 $\implies (\zeta^{p_1})^{p_2} = \zeta^{p_1 p_2}$ 是根。
- 以此类推，最终得出：$\zeta^k$ 必定是 $\Phi_n(x)$ 的根。
4. 这说明：所有指数与 $n$ 互素的单位根，全都是 $\Phi_n(x)$ 的根。
:::
:::bg
现在我们证明了：以 $\zeta$ 为根的最小多项式 $\Phi_n(x)$ 的根，是且只能是形如「$\zeta^k$」（$k$ 与 $n$ 互素）的单位根。
这样的单位根一共有 $\varphi(n)$ 个，$\varphi(n)$ 是「欧拉函数」，即 $1\cdots n$ 中和 $n$ 互素的正整数的个数。
因此，$\Phi_n(x)$ 的次数，就等于 $\varphi(n)$。
:::

## 5.4 得到 $n$ 的最终表达式

:::bg
前面 5.2 小节的末尾，我们得到了：
$p_n = 2^{k_4}$
这里的 $p_n$ 就是以 $\zeta$ 为根的最小多项式 $\Phi_n(x)$ 的次数，我们刚刚知道它等于欧拉函数 $\varphi(n)$。
$k_4$ 是一个不确定的正整数，我们改用 $k$ 代表它，即：

$\varphi(n) = 2^k$

基于这个起点，我们可以通过标准的数论工具，极其严密且初等地推导出 $n$ 的通用表达式。
:::

### 第一步：写出欧拉函数 $\varphi(n)$ 的展开式
:::bg
根据算术基本定理，任何正整数 $n$ 都可以唯一分解为素数幂的乘积。我们设：

$n = p_1^{a_1} p_2^{a_2} \dots p_m^{a_m}$

根据「附录10」中的欧拉函数展开公式，我们有：

$\varphi(n) = p_1^{a_1-1}(p_1 - 1) p_2^{a_2-1}(p_2 - 1) \dots p_m^{a_m-1}(p_m - 1)$
:::

### 第二步：强制施加“2的幂次”约束
:::bg
我们的目标是让 $\varphi(n) = 2^k$。
这意味着上面公式中，「每一个乘积因子都必须是2的幂」。
现在我们把素数因子分为“素数2”和“奇素数”两类来分别剖析。
:::

### 第三步：分析素因子2的贡献
:::bg
如果 $n$ 的因数中包含2（设 $p_1 = 2$），那么它对应的因子是：
$2^{a_1-1}(2 - 1) = 2^{a_1-1}$
这本身就是一个2的幂。因此，素数2的指数 $a_1$ 可以是任何非负整数。它对 $\varphi(n)$ 成为2的幂没有任何阻碍。
:::

### 第四步：分析奇素数因子的严苛限制
:::bg
这是推导中最核心的一步。对于任何大于2的奇素数 $p_i$，它在公式中贡献了两个部分：$p_i^{a_i-1}$ 和 $(p_i - 1)$。这两部分都必须是2的幂。

1. 指数必须为1：
因为 $p_i$ 是奇数，奇数的任何正整数次幂仍然是奇数。要让 $p_i^{a_i-1}$ 成为2的幂，它只能等于1（即 $2^0$）。这要求 $a_i - 1 = 0$，也就是 $a_i = 1$。

结论：$n$ 的分解式中，所有的奇素数因子都不能有重因数，只能出现一次。

2. 素数本身的形式：
剩下的一项 $(p_i - 1)$ 也必须是2的幂。因此必须存在某个正整数 $m$，使得：
$p_i - 1 = 2^m \implies p_i = 2^m + 1$

结论：参与的奇素数，必须能够写成 $2^m + 1$ 的形式。
:::

### 第五步：推导费马素数 (Fermat Primes)
:::bg
什么样的 $m$ 能让 $2^m + 1$ 成为素数呢？
假设 $m$ 包含一个大于1的奇数因子 $q$，即 $m = q \cdot r$。那么根据多项式因式分解公式：

$2^m + 1 = (2^r)^q + 1 = (2^r + 1)((2^r)^{q-1} - (2^r)^{q-2} + \dots + 1)$

此时 $2^m + 1$ 能够被 $2^r + 1$ 整除，它就不是素数了（矛盾）。
因此，$m$ 绝对不能含有任何奇数因子。$m$ 自身也必须是2的幂，即 $m = 2^t$。

我们将这种形如 $F_t = 2^{2^t} + 1$ 的素数，称为费马素数。
目前已知的费马素数只有前5个（$t = 0, 1, 2, 3, 4$ 时，分别对应 $3, 5, 17, 257, 65537$）。
:::

### 最终结论：$n$ 的通用表达式
:::bg
综合以上所有的推导：
- $n$ 可以包含任意次方的2。
- $n$ 可以包含奇素数，但这些奇素数必须是互不相同的费马素数，且指数只能为1。

由此，我们得出了正 $n$ 边形可尺规作图的「必要条件」—— $n$ 的通用表达式为：

$n = 2^r \cdot p_1 \cdot p_2 \dots p_s$

其中：
- $r$ 是任意非负整数（$r \ge 0$）。
- $p_1, p_2, \dots, p_s$ 是互不相同的费马素数（$s \ge 0$，即可以没有奇素数因子）。
:::