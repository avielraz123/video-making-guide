"""Expanding (a + b)^2 step by step with MathTex.

Render (720p, 30 fps):  manim -qm equation.py EquationScene
Output lands in media/videos/equation/720p30/EquationScene.mp4
"""
from manim import *

config.background_color = "#0f1b33"  # shared navy background
AMBER = "#ffb547"


class EquationScene(Scene):
    def construct(self):
        title = Text("Expanding (a + b)²", font="Segoe UI", weight=BOLD, font_size=40)
        title.to_edge(UP, buff=0.6)

        # Splitting the TeX into pieces ("{{ }}") lets Manim match pieces between steps.
        step1 = MathTex("(a+b)^2", font_size=96)
        step2 = MathTex("(a+b)", "(a+b)", font_size=96)
        step3 = MathTex("a^2", "+", "ab", "+", "ba", "+", "b^2", font_size=96)
        step4 = MathTex("a^2", "+", "2ab", "+", "b^2", font_size=96)
        step4[2].set_color(AMBER)  # highlight the middle term

        self.play(FadeIn(title, shift=DOWN * 0.3), Write(step1), run_time=1.2)
        self.wait(0.6)
        # TransformMatchingTex morphs pieces with equal TeX into each other
        self.play(TransformMatchingTex(step1, step2), run_time=1.2)
        self.wait(0.5)
        self.play(TransformMatchingTex(step2, step3), run_time=1.4)
        self.wait(0.4)

        # Show that ab and ba are the same term before merging them
        box = SurroundingRectangle(VGroup(step3[2], step3[4]), color=AMBER, buff=0.15)
        self.play(Create(box), step3[2].animate.set_color(AMBER), step3[4].animate.set_color(AMBER))
        self.wait(0.4)
        self.play(FadeOut(box), TransformMatchingTex(step3, step4), run_time=1.4)

        # Geometric meaning: the area of a square with side a + b
        self.play(step4.animate.scale(0.6).next_to(title, DOWN, buff=0.5))
        a, b = 2.4, 1.4
        sq_a = Square(a).set_fill(BLUE_D, 0.6).set_stroke(WHITE, 2)
        sq_b = Square(b).set_fill(BLUE_D, 0.6).set_stroke(WHITE, 2)
        r1 = Rectangle(width=b, height=a).set_fill(AMBER, 0.7).set_stroke(WHITE, 2)
        r2 = Rectangle(width=a, height=b).set_fill(AMBER, 0.7).set_stroke(WHITE, 2)
        sq_b.next_to(sq_a, RIGHT, buff=0).align_to(sq_a, DOWN).shift(DOWN * b)
        r1.next_to(sq_a, RIGHT, buff=0)
        r2.next_to(sq_a, DOWN, buff=0)
        square = VGroup(sq_a, r1, r2, sq_b).move_to(DOWN * 1.25)
        labels = VGroup(
            MathTex("a^2").move_to(sq_a), MathTex("ab").move_to(r1),
            MathTex("ab").move_to(r2), MathTex("b^2").move_to(sq_b),
        )
        self.play(LaggedStart(*[GrowFromCenter(p) for p in square], lag_ratio=0.25), run_time=1.5)
        self.play(FadeIn(labels))
        self.wait(1.2)
