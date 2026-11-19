"""A function plot with a tangent line that slides along the curve.

Teaches: Axes + plot, ValueTracker, and always_redraw (objects that rebuild
themselves every frame from the tracker's current value).

Render (720p, 30 fps):  manim -qm tangent.py TangentScene
"""
from manim import *
import numpy as np

config.background_color = "#0f1b33"
AMBER = "#ffb547"


def f(x):
    return 0.15 * x**3 - 0.9 * x + 1  # the function we plot


def df(x):
    return 0.45 * x**2 - 0.9  # its derivative = slope of the tangent


def tangent_line(axes, x0, half_len=1.5):
    """Tangent segment at x0 with a fixed on-screen length (steep or flat)."""
    m = df(x0)
    ux, uy = axes.x_length / 7, axes.y_length / 6  # scene units per axis unit
    dx = half_len / np.hypot(ux, m * uy)  # how far to go in x for that length
    return Line(axes.c2p(x0 - dx, f(x0) - m * dx), axes.c2p(x0 + dx, f(x0) + m * dx),
                color=AMBER, stroke_width=4)


class TangentScene(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-3.5, 3.5, 1], y_range=[-2, 4, 1],
            x_length=10, y_length=5.4,
            axis_config={"color": GREY_B, "include_tip": False},
        ).shift(DOWN * 0.4)
        curve = axes.plot(f, x_range=[-3.3, 3.3], color=BLUE_C, stroke_width=5)
        label = MathTex(r"f(x) = 0.15x^3 - 0.9x + 1", font_size=40).to_corner(UL, buff=0.5)

        # The tracker holds one number: the x where the tangent touches the curve.
        x = ValueTracker(-3)

        # always_redraw: these lambdas run every frame, reading x.get_value()
        dot = always_redraw(lambda: Dot(axes.c2p(x.get_value(), f(x.get_value())), color=AMBER, radius=0.1))
        tangent = always_redraw(lambda: tangent_line(axes, x.get_value()))
        slope = always_redraw(lambda: MathTex(
            rf"\text{{slope}} = {df(x.get_value()):+.2f}", font_size=40, color=AMBER,
        ).to_corner(UR, buff=0.5))

        self.play(Create(axes), run_time=1)
        self.play(Create(curve), Write(label), run_time=1.5)
        self.play(FadeIn(dot), Create(tangent), FadeIn(slope))
        # Animate the tracker; everything built from it follows automatically
        self.play(x.animate.set_value(np.sqrt(2)), run_time=3, rate_func=smooth)
        self.wait(0.3)
        # At x = sqrt(2) the slope is 0: flag the local minimum
        flag = Text("slope 0: local minimum", font="Segoe UI", font_size=26).next_to(dot, DOWN, buff=0.35)
        self.play(FadeIn(flag, shift=UP * 0.2))
        self.wait(0.6)
        self.play(FadeOut(flag), x.animate.set_value(2.8), run_time=2, rate_func=smooth)
        self.wait(0.8)
