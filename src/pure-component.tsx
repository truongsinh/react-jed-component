import * as Jed from "jed";
import * as React from "react";

export interface IGettextProp {
  languageCode: string;
  languageLoadedCallback?(err?: Error): void;
}

export abstract class JedPureComponent<P, S> extends React.PureComponent<IGettextProp, S> {
  public props: Readonly<{ children?: React.ReactNode }> & Readonly<IGettextProp> & Readonly<P>;
  private i18n = new Jed({});
  // tslint:disable-next-line no-any
  protected constructor(props?: IGettextProp & P, context?: any) {
    super(props, context);
    // This promise is self-handed
    // tslint:disable-next-line no-floating-promises
    this.initLanguage();
  }
  protected _(msgid: string): string {
    return this.i18n.gettext.apply(this.i18n, arguments);
  }
  protected abstract async getTranslation(): Promise<{}>;
  protected ngettext(msgid: string, msgidPlural: string, value: number): string {
    return this.i18n.ngettext.apply(this.i18n, arguments);
  }

  private async initLanguage() {
    // tslint:disable-next-line strict-boolean-expressions
    const languageLoadedCallback = this.props.languageLoadedCallback || ((err?: Error) => {
      // tslint:disable-next-line strict-boolean-expressions
      if (err && console) {
        // tslint:disable-next-line no-console
        console.warn(err);
      }
    });
    try {
      const l = await this.getTranslation();
      this.i18n = new Jed(l);
      this.forceUpdate();
      languageLoadedCallback();
    } catch (e) {
      languageLoadedCallback(e);
    }
  }
}
