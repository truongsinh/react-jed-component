import * as Jed from "jed";
import * as React from "react";

export interface IGettextProp {
  languageCode: string;
  languageLoadedCallback?(err: Error): void;
  languageLoadedCallback?(err: undefined, newLanguageRendered: boolean): void;
}

export abstract class JedPureComponent<P, S> extends React.PureComponent<IGettextProp, S> {
  public props: Readonly<{ children?: React.ReactNode }> & Readonly<IGettextProp> & Readonly<P>;
  private i18n = new Jed({});
  // Any is neccessary here
  // tslint:disable-next-line no-any
  protected constructor(props?: IGettextProp & P, context?: any) {
    super(props, context);
    // This promise is self-handled
    // tslint:disable-next-line no-floating-promises
    this.initLanguage();
  }
  protected _(msgid: string): string {
    return this.i18n.gettext.apply(this.i18n, arguments);
  }
  protected abstract async getTranslation(): Promise<{} | void>;
  protected ngettext(msgid: string, msgidPlural: string, value: number): string {
    return this.i18n.ngettext.apply(this.i18n, arguments);
  }

  private async initLanguage() {
    const propCallback = this.props.languageLoadedCallback;
    const languageLoadedCallback = typeof propCallback === "function" ? propCallback : ((err?: Error) => {
      if (err !== undefined && window.hasOwnProperty("console")) {
        // We don't want silient failure
        // tslint:disable-next-line no-console
        console.warn(err);
      }
    });
    try {
      const l = await this.getTranslation();
      if (l === undefined) {
        languageLoadedCallback(undefined, false);
        return;
      }
      this.i18n = new Jed(l);
      this.forceUpdate();
      languageLoadedCallback(undefined, true);
    } catch (e) {
      languageLoadedCallback(e);
    }
  }
}
