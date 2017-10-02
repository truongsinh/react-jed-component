import * as Jed from "jed";
import * as React from "react";

export interface IGettextProp {
	languageCode: string;
	languageLoadedCallback?: (err?: Error) => void;
}

export abstract class JedPureComponent<P, S> extends React.PureComponent<IGettextProp, S> {
	private i18n = new Jed({locale_data: { messages: { "": {} } } });
	props: Readonly<{ children?: React.ReactNode }> & Readonly<IGettextProp> & Readonly<P>;

	constructor(props?: IGettextProp & P, context?: any) {
		super(props, context);
		this.props
		this.initLanguage();
	}
	protected abstract async getTranslation(): Promise<void>;
	protected _(msgid: string): string {
		return this.i18n.gettext.apply(this.i18n, arguments);
	}
	protected ngettext(msgid: string, msgid_plural: string, value: number): string {
		return this.i18n.ngettext.apply(this.i18n, arguments);
	}

	private async initLanguage() {
		const languageLoadedCallback = this.props.languageLoadedCallback || ((err?: Error) => {
			if (err && console) {
				console.warn(err)
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
