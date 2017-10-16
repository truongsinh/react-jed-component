// tslint:disable: max-classes-per-file
import * as React from "react";
import * as renderer from "react-test-renderer";
import { JedPureComponent, sprintf } from "./index";

type langeEnum = "yy";

describe("error when loading langauge", () => {
  class MyComponent extends JedPureComponent<{}, {}, langeEnum> {
    // tslint:disable-next-line prefer-function-over-method
    public render(): false {
      return false;
    }
    // tslint:disable-next-line prefer-function-over-method
    protected async getTranslation(): Promise<{}> {
      throw new Error("test error");
    }
  }
  it("throws promise error if callback provided", async () => {
    const languageLoadedPromise = new Promise((resolve, reject) => {
      renderer.create(
        <MyComponent
          languageCode="yy"
          languageLoadedCallback={(e?: Error, render?: boolean) => (e === undefined ? resolve(render) : reject(e))}
        ></MyComponent>,
      );
    });
    await expect(languageLoadedPromise).rejects.toEqual(new Error("test error"));
  });
  it("invoke `console.warn` if callback not provided", async () => {
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
  class MyComponent extends JedPureComponent<{}, {}, langeEnum> {
    public render() {
      return <span>{this._("Hello world")}</span>;
    }
    // tslint:disable-next-line prefer-function-over-method
    protected async getTranslation() {
      return {};
    }
  }
  it("renders immediately and after waiting for language resolve", async () => {
    let component: renderer.ReactTestInstance;
    const languageLoadedPromise = new Promise((resolve, reject) => {
      component = renderer.create(
        <MyComponent
          languageCode="yy"
          languageLoadedCallback={(e?: Error, render?: boolean) => e === undefined ? resolve(render) : reject(e)}
        ></MyComponent>,
      );
    });
    // tslint:disable-next-line no-non-null-assertion no-unnecessary-type-assertion
    component = component!;
    const mockCallback = jest.fn();
    (component.getInstance() as React.Component).componentDidUpdate = mockCallback;
    expect(component.toJSON()).toMatchSnapshot();
    await expect(languageLoadedPromise).resolves.toEqual(true);
    expect(mockCallback.mock.calls.length).toBe(1);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe("getTranslation returns jed objects", () => {
  class MyComponent extends JedPureComponent<{}, {}, langeEnum> {
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
  it("renders default language, then translated language, with callback", async () => {
    let component: renderer.ReactTestInstance;
    const languageLoadedPromise = new Promise((resolve, reject) => {
      component = renderer.create(
        <MyComponent
          languageCode="yy"
          languageLoadedCallback={(e?: Error, render?: boolean) => (e === undefined ? resolve(render) : reject(e))}
        ></MyComponent>,
      );
    });
    // tslint:disable-next-line no-non-null-assertion no-unnecessary-type-assertion
    component = component!;
    const mockCallback = jest.fn();
    (component.getInstance() as React.Component).componentDidUpdate = mockCallback;
    expect(component.toJSON()).toMatchSnapshot();
    await expect(languageLoadedPromise).resolves.toEqual(true);
    expect(mockCallback.mock.calls.length).toBe(1);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("renders default language, then translated language, without callback", async () => {
    const component = renderer.create(
      <MyComponent
        languageCode="yy"
      ></MyComponent>,
    );
    const componentUpdatePromise = new Promise((resolve) => {
      (component.getInstance() as React.Component).componentDidUpdate = resolve;
    });
    expect(component.toJSON()).toMatchSnapshot();
    await expect(componentUpdatePromise).resolves.toEqual({languageCode: "yy"});
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe("getTranslation returns undefined", () => {
  class MyComponent extends JedPureComponent<{}, {}, langeEnum> {
    public render() {
      return <span>{this._("Hello world")}</span>;
    }
    // tslint:disable-next-line prefer-function-over-method
    protected async getTranslation() {
      return;
    }
  }
  it("renders immediately and does not render again", async () => {
    let component: renderer.ReactTestInstance;
    const languageLoadedPromise = new Promise((resolve, reject) => {
      component = renderer.create(
        <MyComponent
          languageCode="yy"
          languageLoadedCallback={(e?: Error, render?: boolean) => (e === undefined ? resolve(render) : reject(e))}
        ></MyComponent>,
      );
    });
    // tslint:disable-next-line no-non-null-assertion no-unnecessary-type-assertion
    component = component!;
    const mockCallback = jest.fn();
    (component.getInstance() as React.Component).componentDidUpdate = mockCallback;
    expect(component.toJSON()).toMatchSnapshot();
    await expect(languageLoadedPromise).resolves.toEqual(false);
    expect(mockCallback.mock.calls.length).toBe(0);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
