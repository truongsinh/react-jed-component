// tslint:disable: max-classes-per-file
import * as React from "react";
import * as renderer from "react-test-renderer";
import { JedPureComponent, sprintf } from "./index";

describe("error when loading langauge", () => {
  class MyComponent extends JedPureComponent<{}, {}> {
    // tslint:disable-next-line prefer-function-over-method
    public render(): false {
      return false;
    }
    // tslint:disable-next-line prefer-function-over-method
    protected async getTranslation(): Promise<{}> {
      throw new Error("test error");
    }
  }
  it("throws promise error", async () => {
    let tree;
    const languageLoadedPromise = new Promise((resolve, reject) => {
      tree = renderer.create(
        <MyComponent
          languageCode="yy"
          languageLoadedCallback={(e) => (e === undefined ? resolve() : reject(e))}
        ></MyComponent>,
      ).toJSON();
    });
    await expect(languageLoadedPromise).rejects.toEqual(new Error("test error"));
  });
  it("invoke `console.warn`", async () => {
    // tslint:disable-next-line no-unbound-method
    const originalWarn = console.warn;
    const warnPromise = new Promise((resolve) => {
      console.warn = resolve;
    });
    renderer.create(
      <MyComponent
        languageCode="yy"
      ></MyComponent>,
    ).toJSON();
    await expect(warnPromise).resolves.toEqual(new Error("test error"));
    console.warn = originalWarn;
  });
});

describe("getTranslation returns empty objects", () => {
  class MyComponent extends JedPureComponent<{}, {}> {
    public render() {
      return <span>{this._("Hello world")}</span>;
    }
    // tslint:disable-next-line prefer-function-over-method
    protected async getTranslation() {
      return {};
    }
  }
  it("renders immediately", () => {
    const tree = renderer.create(
      <MyComponent
        languageCode="yy"
      ></MyComponent>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("renders after waiting for language resolve", async () => {
    let tree;
    const languageLoadedPromise = new Promise((resolve, reject) => {
      tree = renderer.create(
        <MyComponent
          languageCode="yy"
          languageLoadedCallback={(e) => e === undefined ? resolve() : reject(e)}
        ></MyComponent>,
      ).toJSON();
    });
    await expect(languageLoadedPromise).resolves.toEqual(undefined);
    expect(tree).toMatchSnapshot();
  });
});

describe("getTranslation returns jed objects", () => {
  class MyComponent extends JedPureComponent<{}, {}> {
    public render() {
      const k = ["%s dog", "%s dogs"];
      const n1 = sprintf(this.ngettext(k[0], k[1], 1), 1);
      const n2 = sprintf(this.ngettext(k[0], k[1], 2), 2);
      return <span>{n1}, {n2}</span>;
    }
    // tslint:disable-next-line prefer-function-over-method
    protected async getTranslation() {
      return {
        locale_data: {
          messages: {
            "": {
              lang: "yy",
            },
            "%s dog": ["%s hunden", "%s hundra"],
          },
        },
      };
    }
  }
  it("renders default language, then translated language", async () => {
    let component: renderer.ReactTestInstance;
    const languageLoadedPromise = new Promise((resolve, reject) => {
      component = renderer.create(
        <MyComponent
          languageCode="yy"
          languageLoadedCallback={(e) => (e === undefined ? resolve() : reject(e))}
        ></MyComponent>,
      );
    });
    // tslint:disable-next-line no-non-null-assertion no-unnecessary-type-assertion
    component = component!;
    expect(component.toJSON()).toMatchSnapshot();
    await expect(languageLoadedPromise).resolves.toEqual(undefined);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
