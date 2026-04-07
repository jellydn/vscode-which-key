import * as assert from "assert";
import { CommandRelay, KeybindingArgs } from "../../commandRelay";

suite("CommandRelay Tests", () => {
  let cmdRelay: CommandRelay;

  setup(() => {
    cmdRelay = new CommandRelay();
  });

  teardown(() => {
    cmdRelay.dispose();
  });

  test("can be instantiated", () => {
    assert.ok(cmdRelay);
  });

  test("triggerKey emits key event", function (done) {
    this.timeout(1000);
    const testKey = "a";
    const disposable = cmdRelay.onDidKeyPressed((event: KeybindingArgs) => {
      assert.strictEqual(event.key, testKey);
      disposable.dispose();
      done();
    });

    cmdRelay.triggerKey(testKey);
  });

  test("triggerKey includes when context", function (done) {
    this.timeout(1000);
    const testKey = "b";
    const testWhen = "editorTextFocus";
    const disposable = cmdRelay.onDidKeyPressed((event: KeybindingArgs) => {
      assert.strictEqual(event.key, testKey);
      assert.strictEqual(event.when, testWhen);
      disposable.dispose();
      done();
    });

    cmdRelay.triggerKey({ key: testKey, when: testWhen });
  });

  test("undoKey emits undo event", function (done) {
    this.timeout(1000);
    const disposable = cmdRelay.onDidUndoKey(() => {
      disposable.dispose();
      done();
    });

    cmdRelay.undoKey();
  });

  test("searchBindings emits search event", function (done) {
    this.timeout(1000);
    const disposable = cmdRelay.onDidSearchBindings(() => {
      disposable.dispose();
      done();
    });

    cmdRelay.searchBindings();
  });

  test("toggleZenMode emits toggle event", function (done) {
    this.timeout(1000);
    const disposable = cmdRelay.onDidToggleZenMode(() => {
      disposable.dispose();
      done();
    });

    cmdRelay.toggleZenMode();
  });

  test("multiple listeners receive events", function (done) {
    this.timeout(1000);
    let count = 0;
    const disposable1 = cmdRelay.onDidKeyPressed(() => {
      count++;
      if (count === 2) {
        disposable1.dispose();
        disposable2.dispose();
        done();
      }
    });
    const disposable2 = cmdRelay.onDidKeyPressed(() => {
      count++;
      if (count === 2) {
        disposable1.dispose();
        disposable2.dispose();
        done();
      }
    });

    cmdRelay.triggerKey("x");
  });
});
