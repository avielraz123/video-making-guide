from manim import *


class EquationScene(Scene):
    """Fixture source file used by the smoke test."""

    def construct(self):
        eq = MathTex(r"a^2 + b^2 = c^2", font_size=96)
        self.play(Write(eq), run_time=1.2)
        self.wait(0.5)
        # transform into a solved form
        solved = MathTex(r"c = \sqrt{a^2 + b^2}", font_size=96)
        self.play(TransformMatchingTex(eq, solved), rate_func=rate_functions.ease_out_cubic)
        self.wait(1)
