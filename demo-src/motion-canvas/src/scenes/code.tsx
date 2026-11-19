// Code-block animation: code types itself in, lines get highlighted while a
// live value on the right updates, then one line is edited in place.
// Motion Canvas / Revideo scenes are generator functions: every `yield*`
// plays an animation and waits for it to finish, so the file reads like a script.
import { Code, LezerHighlighter, Rect, Txt, lines, makeScene2D, word } from "@revideo/2d";
import { DEFAULT, all, createRef, easeInOutCubic, map, tween, waitFor } from "@revideo/core";
import { parser } from "@lezer/javascript";

Code.defaultHighlighter = new LezerHighlighter(parser); // JavaScript syntax colors

const AMBER = "#ffb547";
const MONO = "Consolas, 'Courier New', monospace";

export default makeScene2D("code", function* (view) {
  const code = createRef<Code>();
  const card = createRef<Rect>();
  const sumTxt = createRef<Txt>();
  let sum = 0;

  // Count the displayed value from its current number to `to` over `secs`.
  function* countTo(to: number, secs: number) {
    const from = sum;
    yield* tween(secs, (t) => sumTxt().text(`sum = ${Math.round(map(from, to, easeInOutCubic(t)))}`));
    sum = to;
  }

  view.add(
    <>
      <Rect x={-170} width={780} height={400} radius={18} fill="#1a2a4a" stroke="#2c4170" lineWidth={2}>
        <Code ref={code} fontSize={34} fontFamily={MONO} code="" offsetX={-1} x={-350} />
      </Rect>
      <Rect ref={card} x={430} width={300} height={200} radius={18} fill="#1a2a4a" stroke="#2c4170" lineWidth={2} layout direction="column" alignItems="center" justifyContent="center" gap={10}>
        <Txt text="prices = [12, 8, 15]" fontFamily={MONO} fontSize={22} fill="#8aa0c0" />
        <Txt ref={sumTxt} text="sum = 0" fontFamily={MONO} fontSize={48} fontWeight={700} fill="#e8eef8" />
      </Rect>
    </>,
  );

  // 1) Type the function in, one line at a time.
  const src = [
    "function total(prices) {\n",
    "  let sum = 0;\n",
    "  for (const p of prices) {\n",
    "    sum += p;\n",
    "  }\n",
    "  return sum;\n",
    "}",
  ];
  for (const line of src) yield* code().code.append(line, 0.25);
  yield* waitFor(0.3);

  // 2) Step through it: highlight a line, update the value next to it.
  yield* code().selection(lines(1), 0.4);
  yield* waitFor(0.3);
  for (const target of [12, 20, 35]) {
    yield* code().selection(lines(3), 0.25);
    yield* countTo(target, 0.45);
    yield* waitFor(0.15);
  }
  yield* all(code().selection(lines(5), 0.4), card().stroke(AMBER, 0.4));
  yield* waitFor(0.5);

  // 3) Edit the code in place: Motion Canvas animates the diff.
  yield* all(
    code().code.replace(word(3, 4, 9), "sum += p * 2;", 0.6), // line 3, column 4, 9 chars
    code().selection(lines(3), 0.6),
  );
  yield* countTo(70, 0.6);
  yield* waitFor(0.6);
  yield* code().selection(DEFAULT, 0.5); // clear the highlight
  yield* waitFor(0.6);
});
