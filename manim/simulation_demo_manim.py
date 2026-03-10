# ruff: noqa: F403, F405, F841
"""
Grossberg Ch.2 - Noise-Saturation Dilemma: Manim Visualization
Run: manim -pqh simulation_demo_manim.py NoiseSaturationDilemma
"""

from manim import *


class NoiseSaturationDilemma(Scene):
    def construct(self):
        B = 10.0
        A = 1.0
        thetas = [0.40, 0.30, 0.20, 0.10]
        cell_colors = [RED_C, YELLOW_C, GREEN_C, BLUE_C]

        # -- Title --
        title = Text("Noise-Saturation Dilemma", font_size=40, color=WHITE)
        subtitle = Text(
            "Grossberg, Conscious MIND Resonant BRAIN Ch.2",
            font_size=22,
            color=GREY_B,
        )
        subtitle.next_to(title, DOWN, buff=0.3)
        self.play(Write(title), FadeIn(subtitle, shift=UP * 0.3))
        self.wait(1.5)
        self.play(FadeOut(title), FadeOut(subtitle))

        # -- Phase 1: Problem statement --
        problem = Text(
            "Problem: finite neurons, infinite input range",
            font_size=30,
            color=YELLOW_C,
        )
        problem.to_edge(UP, buff=0.5)
        self.play(Write(problem))
        self.wait(1)

        # -- Two axes --
        ax_left = Axes(
            x_range=[0, 100, 20],
            y_range=[0, 12, 2],
            x_length=5.2,
            y_length=3.5,
            axis_config={"color": GREY_B, "include_numbers": True, "font_size": 22},
            tips=False,
        ).shift(LEFT * 3.2 + DOWN * 0.5)

        ax_right = Axes(
            x_range=[0, 100, 20],
            y_range=[0, 12, 2],
            x_length=5.2,
            y_length=3.5,
            axis_config={"color": GREY_B, "include_numbers": True, "font_size": 22},
            tips=False,
        ).shift(RIGHT * 3.2 + DOWN * 0.5)

        lbl_l = Text("[X] No Interaction", font_size=22, color=RED_C)
        lbl_l.next_to(ax_left, UP, buff=0.25)
        lbl_r = Text("[O] On-center Off-surround", font_size=22, color=GREEN_C)
        lbl_r.next_to(ax_right, UP, buff=0.25)

        xl = MathTex(r"I", font_size=28, color=GREY_B).next_to(ax_left, DOWN, buff=0.3)
        xr = MathTex(r"I", font_size=28, color=GREY_B).next_to(ax_right, DOWN, buff=0.3)

        self.play(
            Create(ax_left),
            Create(ax_right),
            Write(lbl_l),
            Write(lbl_r),
            Write(xl),
            Write(xr),
        )

        # -- B line --
        bl = ax_left.plot(
            lambda x: B,
            x_range=[0, 100],
            color=RED_C,
            stroke_width=1,
            stroke_opacity=0.3,
        )
        br = ax_right.plot(
            lambda x: B,
            x_range=[0, 100],
            color=GREEN_C,
            stroke_width=1,
            stroke_opacity=0.3,
        )
        bl_txt = MathTex(r"B", font_size=22, color=RED_C).move_to(
            ax_left.c2p(95, B + 0.7)
        )
        br_txt = MathTex(r"B", font_size=22, color=GREEN_C).move_to(
            ax_right.c2p(95, B + 0.7)
        )
        self.play(Create(bl), Create(br), Write(bl_txt), Write(br_txt))

        # -- Curves --
        for theta, col in zip(thetas, cell_colors):
            cl = ax_left.plot(
                lambda x, th=theta: B * th * x / (A + th * x),
                x_range=[0.1, 100],
                color=col,
                stroke_width=3,
            )
            cr = ax_right.plot(
                lambda x, th=theta: B * th * x / (A + x),
                x_range=[0.1, 100],
                color=col,
                stroke_width=3,
            )
            tl = MathTex(
                rf"\theta={theta:.2f}",
                font_size=18,
                color=col,
            ).move_to(ax_right.c2p(85, B * theta + 0.4))
            self.play(Create(cl), Create(cr), FadeIn(tl), run_time=0.7)

        self.wait(0.5)

        # -- Phase 2: Sweep I --
        self.play(FadeOut(problem))
        tracker = ValueTracker(1)

        vl = always_redraw(
            lambda: Line(
                ax_left.c2p(tracker.get_value(), 0),
                ax_left.c2p(tracker.get_value(), 12),
                color=WHITE,
                stroke_width=1.5,
                stroke_opacity=0.4,
            )
        )
        vr = always_redraw(
            lambda: Line(
                ax_right.c2p(tracker.get_value(), 0),
                ax_right.c2p(tracker.get_value(), 12),
                color=WHITE,
                stroke_width=1.5,
                stroke_opacity=0.4,
            )
        )

        i_label = always_redraw(
            lambda: MathTex(
                rf"I = {tracker.get_value():.0f}",
                font_size=32,
                color=YELLOW_C,
            ).to_edge(UP, buff=0.5)
        )

        def commentary():
            v = tracker.get_value()
            if v < 5:
                return Text("Low I: both models similar", font_size=24, color=GREY_A)
            if v < 30:
                return Text(
                    "Medium I: no-interaction saturating...", font_size=24, color=ORANGE
                )
            return Text(
                "High I: no-interaction ALL at B, on-center keeps ratios!",
                font_size=24,
                color=GREEN_C,
            )

        cmt = always_redraw(lambda: commentary().to_edge(UP, buff=1.05))

        self.play(FadeIn(vl), FadeIn(vr), FadeIn(i_label), FadeIn(cmt))
        self.play(tracker.animate.set_value(5), run_time=2, rate_func=linear)
        self.wait(0.3)
        self.play(tracker.animate.set_value(30), run_time=3, rate_func=linear)
        self.wait(0.3)
        self.play(tracker.animate.set_value(100), run_time=3, rate_func=linear)
        self.wait(1)

        # -- Phase 3: Key equations --
        self.play(*[FadeOut(m) for m in self.mobjects])

        t1 = Text("No interaction:", font_size=30, color=RED_C)
        e1 = MathTex(
            r"x_i = \frac{B\,\theta_i\, I}{A + \theta_i\, I}"
            r"\;\xrightarrow{I\to\infty}\; B",
            font_size=36,
        )
        g1 = VGroup(t1, e1).arrange(DOWN, buff=0.35).shift(UP * 1.5)

        t2 = Text("On-center off-surround:", font_size=30, color=GREEN_C)
        e2 = MathTex(
            r"x_i = \frac{B\,\theta_i\, I}{A + I}"
            r"\;\xrightarrow{I\to\infty}\; B\theta_i",
            font_size=36,
        )
        g2 = VGroup(t2, e2).arrange(DOWN, buff=0.35).shift(DOWN * 1.0)

        vs_arrow = MathTex(r"\Downarrow", font_size=44, color=YELLOW_C).move_to(ORIGIN)

        conclusion = Text(
            "Ratio preserved -- pattern survives any intensity!",
            font_size=26,
            color=YELLOW_C,
        ).to_edge(DOWN, buff=0.7)

        self.play(Write(g1))
        self.wait(0.8)
        self.play(Write(vs_arrow))
        self.play(Write(g2))
        self.wait(0.8)
        self.play(Write(conclusion))
        self.wait(3)
