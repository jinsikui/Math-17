# 附录7 - 费马小定理

我们利用 附录6 中介绍的“新生之梦”定理来证明费马小定理

:::bg
**『费马小定理 (Fermat's Little Theorem)』**：对于任意素数 $p$ 和任意整数 $a$，都满足：
$a^p \equiv a \pmod p$
如果 $a \not\equiv 0 \pmod p$，两边同时乘以 $a^{-1}$，它的等价形式是：当 $a \not\equiv 0 \pmod p$ 时，$a^{p-1} \equiv 1 \pmod p$。
:::
:::bg
证明：利用“新生之梦”与数学归纳法
既然我们在 附录6 已经证明了“新生之梦”，即在模 $p$ 下 $(x + y)^p \equiv x^p + y^p \pmod p$，我们就可以直接利用它。

一、我们先讨论 $a \ge 0$ 的情况

对非负整数 $a$ 进行数学归纳。
1. 奠基：当 $a = 0$ 时，显然 $0^p = 0 \equiv 0 \pmod p$，结论成立。
2. 假设：假设当 $a = k$ 时结论成立，即：
$k^p \equiv k \pmod p$
3. 递推（见证奇迹的时刻）：当 $a = k + 1$ 时，我们需要计算 $(k + 1)^p$。根据“新生之梦”定理，在模 $p$ 下，和的 $p$ 次方等于 $p$ 次方的和，中间项全部为 $0$：
$(k + 1)^p \equiv k^p + 1^p \pmod p$
再把我们的归纳假设 $k^p \equiv k$ 代入上式：
$(k + 1)^p \equiv k + 1 \pmod p$
结论：根据数学归纳法，对于所有非负整数 $a$，都有 $a^p \equiv a \pmod p$。

二、再讨论 $a \lt 0$ 的情况

对于任意给定的负整数 $a$，根据带余除法，我们总能通过加上足够多个 $p$，将其转换为一个非负整数 $r$（其中 $0 \le r < p$）。也就是说，在模 $p$ 的意义下：
$a \equiv r \pmod p$
代入已证结论： 既然 $r$ 是非负整数，必然有：
$r^p \equiv r \pmod p$
传递等式： 根据同余式的乘方性质：
$a^p \equiv r^p \equiv r \equiv a \pmod p$
所以
$a^p \equiv a \pmod p$ 对于负整数同样完美成立！
:::