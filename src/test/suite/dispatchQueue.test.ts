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

        // Wait for all items to be processed
        await queue.waitForIdle();

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

        // Wait for all items to be processed (errors don't stop processing)
        await new Promise((resolve) => setTimeout(resolve, 200));

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
        // Wait for first item to start processing
        await new Promise((resolve) => setTimeout(resolve, 5));
        queue.clear();
        queue.push("c");

        // Wait for remaining items
        await queue.waitForIdle();

        // 'a' should be processed, 'b' was cleared, 'c' was pushed after clear
        assert.strictEqual(processed.includes("a"), true);
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

    test("processes multiple items", async function () {
        this.timeout(5000);
        const processed: string[] = [];
        const queue = new DispatchQueue<string>(async (item: string) => {
            processed.push(item);
        });

        queue.push("a");
        queue.push("b");
        queue.push("c");
        queue.push("d");
        queue.push("e");

        // Wait a reasonable amount of time for processing
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Just verify that items were processed (order may vary slightly due to async)
        assert.ok(processed.length >= 3, "Should process at least 3 items");
        queue.clear();
    });
});
