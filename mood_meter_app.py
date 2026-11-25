import gradio as gr
from mood_meter import analyse, classify, mood_score

COLORS = {"positive": "lightgreen", "negative": "salmon"}


def check(review):
    pieces = []
    for word, points in analyse(review):
        if points > 0:
            label = "positive"
        elif points < 0:
            label = "negative"
        else:
            label = None
        pieces.append((word + " ", label))

    return classify(review), mood_score(review), pieces


demo = gr.Interface(
    fn=check,
    inputs=gr.Textbox(lines=3, label="Paste a review"),
    outputs=[
        gr.Textbox(label="Mood"),
        gr.Number(label="Mood score"),
        gr.HighlightedText(label="Which words decided it?", color_map=COLORS),
    ],
    title="Review Mood Meter",
    description="Green words add points and red words take points away. Total 1 or more is PO",
    examples=[
        ["Amazing phone, I love the camera"],
        ["This is not good at all"],
        ["The screen is great but the battery life is terrible"],
    ],
)

if __name__ == "__main__":
    demo.launch()