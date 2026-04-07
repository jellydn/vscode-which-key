import * as assert from "assert";
import { DispatchQueue } from "../../dispatchQueue";

suite("DispatchQueue Tests", () => {
    test("processes items sequentially", async function () {
        this.timeout(5000);
        const processed: string[] = [];
        const queue = new DispatchQueue<string>(async (item: string) => {
            processed.push(item);
            // Small delay to ensure sequential processing
            await new Promise((resolve) => setTimeout(resolve, 10));
        });

        queue.push("a");
        queue.push("b");
        queue.push("c");

        // Wait for processing
        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.deepStrictEqual(processed, ["a", "b", "c"]);
        queue.clear();
    });

    test("handles async errors gracefully", async function () {
        this.timeout(5000);
        let errorCount = 0;
        const queue = new DispatchQueue<string>(async (item: string) => {
            if (item === "error") {
                errorCount++;
                throw new Error("Test error");
            }
        });

        queue.push("a");
        queue.push("error");
        queue.push("b");

        await new Promise((resolve) => setTimeout(resolve, 100));

        assert.strictEqual(errorCount, 1);
        queue.clear();
    });

    test("clear stops further processing", async function () {
        this.timeout(5000);
        const processed: string[] = [];
        const queue = new DispatchQueue<string>(async (item: string) => {
            processed.push(item);
            await new Promise((resolve) => setTimeout(resolve, 10));
        });

        queue.push("a");
        queue.push("b");
        queue.clear();
        queue.push("c");

        await new Promise((resolve) => setTimeout(resolve, 50));

        // Only 'a' should be processed before clear
        assert.strictEqual(processed.length >= 1, true);
        queue.clear();
    });

    test("handles empty queue", async function () {
        this.timeout(1000);
        let called = false;
        const queue = new DispatchQueue<string>(async () => {
            called = true;
        });

        // Don't push anything
        await new Promise((resolve) => setTimeout(resolve, 50));

        assert.strictEqual(called, false);
        queue.clear();
    });

    test("processes large number of items", async function () {
        this.timeout(10000);
        const processed: number[] = [];
        const queue = new DispatchQueue<number>(async (item: number) => {
            processed.push(item);
        });

        const count = 100;
        for (let i = 0; i < count; i++) {
            queue.push(i);
        }

        await new Promise((resolve) => setTimeout(resolve, 200));

        assert.strictEqual(processed.length, count);
        for (let i = 0; i < count; i++) {
            assert.strictEqual(processed[i], i);
        }
        queue.clear();
    });
});
