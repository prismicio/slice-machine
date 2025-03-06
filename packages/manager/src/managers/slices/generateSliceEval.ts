import { ChatOpenAI } from "@langchain/openai";
import { evaluate } from "langsmith/evaluation";
import type { 
	EvaluationResult, 
	ExperimentResultRow,
} from "langsmith/evaluation";
import { z } from "zod";
import { fetchImage } from "./generateSlice";
import { generateSlice, GenerateSliceArgs } from "./generateSlice";

const openai = new ChatOpenAI({
	modelName: "gpt-4o",
	apiKey: process.env.OPENAI_API_KEY!
})

const EvaluateSliceSchema = z.object({
	score: z
		.number()
		.describe("The similarity score between the two images, from 0 to 100."),
})

async function promptEvaluateSlice(
	imageFile1: Uint8Array,
	imageFile2: Uint8Array,
): Promise<number> {
	const systemPrompt = `
    Compare two images representing a section of a webpage based on the following criteria. Provide a structured analysis with scores for each category. The total score should help quantify the differences between the original and the generated image.

    **Comparison Criteria & Weights:**

    Layout and Alignment (Weight: 3)
        Compare the arrangement of elements (positioning, spacing, structure).
        Score: 0-10 (0 = completely different, 10 = identical).

    Components (Buttons, Images, Other UI Elements) (Weight: 3)
        Compare the presence, size, and placement of interactive and visual elements.
        Score: 0-10 (0 = entirely different components, 10 = identical components).

    Text Content (Weight: 2)
        Compare the wording, structure, and placement of text.
        Score: 0-10 (0 = completely different text, 10 = exact match).

    Design (Font, Colors) (Weight: 2)
        Compare typography, color scheme, and overall styling.
        Score: 0-10 (0 = completely different design, 10 = exact match).

    **Scoring System:**

    Each category is scored from 0 to 10, and the weighted sum determines the final similarity score.
    Final Score=(Layout×3)+(Components×3)+(Text Content×2)+(Design×2)
    Final Score=(Layout×3)+(Components×3)+(Text Content×2)+(Design×2)

    Maximum Score: 100
    Similarity Interpretation:
        90-100: Nearly identical
        70-89: Very similar
        50-69: Some noticeable differences
        30-49: Significantly different
        0-29: Completely different
    
    `.trim()

	const response = await openai
		.withStructuredOutput(EvaluateSliceSchema)
		.invoke([
			["system", systemPrompt],
			[
				"human",
				[
					{
						type: "image_url",
						image_url: {
							url: `data:image/png;base64,${Buffer.from(imageFile1).toString("base64")}`,
						},
					},
					{
						type: "image_url",
						image_url: {
							url: `data:image/png;base64,${Buffer.from(imageFile2).toString("base64")}`,
						},
					},
				],
			],
		])

	return response["score"] / 100
}

interface SliceOutput {
    ouput_image: string;
    output_data: Uint8Array;
}

// Create a custom evaluator function without using RunEvaluator type
const isSimilarSlice = async (
  run: any
): Promise<EvaluationResult> => {  
  const input = run.inputs.input as string;
  const outputs = run.outputs as SliceOutput;
  const inputImage = await fetchImage(input);

  const score = await promptEvaluateSlice(inputImage, outputs.output_data);

  return { key: "is_similar_slice", score: score };
};

type RunEvalArgs = Omit<GenerateSliceArgs, "sliceImageUrl">

export async function runEval(args: RunEvalArgs): Promise<EvaluationResult[] | ExperimentResultRow[]> {
    console.log("runEval args", args);
    
    // Define the target function without explicit typing
    const targetFn = async (example: any) => {
        const inputImageUrl = example.input;

        const { sliceImageUrl, data } = await generateSlice({
            ...args,
            sliceImageUrl: inputImageUrl,
        });

        console.log("Generated slice image", sliceImageUrl);

        return {
            ouput_image: sliceImageUrl,
            output_data: data,
        };
    };
    
    // Use any type for evaluate to bypass TypeScript errors
    const results = await (evaluate as any)(
        targetFn,
        {
            data: "ds-false-theism-59",
            evaluators: [isSimilarSlice],
            experimentPrefix: "fractal",
        }
    );
    
    return results.results;
}