import { SharedSlice } from "@prismicio/types-internal/lib/customtypes"
import { SharedSliceContent } from "@prismicio/types-internal/lib/content"
import { PrismicRepositoryManager } from "../prismicRepository/PrismicRepositoryManager"
import fetch from "../../lib/fetch"
import * as t from "io-ts";
import { WebsiteColorPalette } from "../prismicRepository/types";
import { B } from "msw/lib/glossary-de6278a9";

export type GenerateSliceArgs = {
    colors: WebsiteColorPalette,
    sliceImageUrl: string
    prismicRepository: PrismicRepositoryManager
    onCreateSlice: ({ sliceModel, sliceCode }: { sliceModel: SharedSlice, sliceCode: string }) => Promise<void>
    onUpdateSliceScreenshot: ({ data, sliceModel }: { data: Uint8Array, sliceModel: SharedSlice }) => Promise<void>
    onUpdateSliceMocks: ({ sliceModel, sliceMocks }: { sliceModel: SharedSlice, sliceMocks: SharedSliceContent[] }) => Promise<void>
    onCaptureSliceSimulatorScreenshot: ({ sliceModel } : { sliceModel: SharedSlice }) => Promise<Buffer>
    onUploadSliceImage: ({ data }: { data: Buffer }) => Promise<{ url: string }>
}

export async function generateSlice(args: GenerateSliceArgs): Promise<{
    sliceImageUrl: string,
    data: Buffer,
}> {
    const { 
        sliceImageUrl, 
        prismicRepository, 
        onCreateSlice, 
        onUpdateSliceScreenshot,
        onUpdateSliceMocks, 
        onCaptureSliceSimulatorScreenshot,
        onUploadSliceImage,
        colors,
     } = args

    // ----- Q1 scope -----
    const sliceImage = await fetchImage(sliceImageUrl);
    console.log("STEP 1: Slice image uploaded to:", sliceImageUrl);

    const executionArn = await prismicRepository.generateSliceTask({
        screenshotUrl: sliceImageUrl,
        colors,
    });

    const { codeUrl, modelUrl, mocksUrl } =
        await pollSliceTask(prismicRepository, executionArn);
    const sliceCode = await fetchSliceCode(codeUrl);
    const sliceModel = await fetchSliceModel(modelUrl);
    const sliceMocks = await fetchSliceMocks(mocksUrl);

    await onCreateSlice({
        sliceModel,
        sliceCode,
    });

    await onUpdateSliceScreenshot({
        data: sliceImage,
        sliceModel,
    });

    await onUpdateSliceMocks({
        sliceModel,
        sliceMocks,
    });

    const screenshot = await onCaptureSliceSimulatorScreenshot({ sliceModel })

    const { url: renderedSliceImageUrl } = await onUploadSliceImage({ data: screenshot });

    return {
        sliceImageUrl: renderedSliceImageUrl,
        data: screenshot,
    }
}

export const fetchSliceCode = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const data = await response.text();
    return data;
};

export const fetchSliceModel = async (url: string): Promise<SharedSlice> => {
    const response = await fetch(url);
    const data = await response.json();
    const res = SharedSlice.decode(data);
    if (res._tag === "Left") {
        throw new Error("Failed to decode slice model");
    } else {
        return res.right;
    }
};

export const fetchSliceMocks = async (
    url: string,
): Promise<SharedSliceContent[]> => {
    const response = await fetch(url);
    const data = await response.json();
    const res = t.array(SharedSliceContent).decode(data);
    if (res._tag === "Left") {
        throw new Error("Failed to decode slice mocks");
    } else {
        return res.right;
    }
};


export async function fetchImage(url: string): Promise<Uint8Array> {
	const response = await fetch(url)
	const arrayBuffer = await response.arrayBuffer()
	return new Uint8Array(arrayBuffer)
}

export const pollSliceTask = async (
    prismicRepository: PrismicRepositoryManager,
    executionArn: string,
    intervalMs = 1000,
): Promise<{ codeUrl: string; modelUrl: string; mocksUrl: string }> => {
    return new Promise(async (resolve, reject) => {
        const step = async () => {
            const response = await prismicRepository.getSliceTask({
                executionArn,
            });
            console.log("Slice task status:", response.status);
            switch (response.status) {
                case "FAILED":
                    reject(new Error(`Slice generation task failed`));
                case "TIMED_OUT":
                    reject(new Error("Slice generation task timed out"));
                case "ABORTED":
                    reject(new Error("Slice generation task was aborted"));
                case "RUNNING":
                    setTimeout(step, intervalMs);
                    break;
                case "SUCCEEDED":
                    if (
                        !response.codeUrl ||
                        !response.modelUrl ||
                        !response.mocksUrl
                    ) {
                        reject(
                            new Error("Slice generation task succeeded but missing URLs"),
                        );
                    } else {
                        resolve({
                            codeUrl: response.codeUrl,
                            modelUrl: response.modelUrl,
                            mocksUrl: response.mocksUrl,
                        });
                    }
                    break;
                default:
                    throw new Error(`Unknown task status: ${response.status}`);
            }
        };
        step();
    });
};
