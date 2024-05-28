import { settingData, sGet, sSet } from "../../utils.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class HealthEstimateSettingsV2 extends HandlebarsApplicationMixin(ApplicationV2) {
	path = "core";

	static DEFAULT_OPTIONS = {
		classes: ["form", "healthEstimate"],
		position: {
			width: 640,
			height: "auto",
		},
		form: {
			closeOnSubmit: true,
		},
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
		},
	};

	static PARTS = {
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	static BUTTONS = {
		buttons: [
			{ type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" },
			{ type: "reset", action: "reset", icon: "fa-solid fa-undo", label: "SETTINGS.Reset" },
		],
	};

	_initializeApplicationOptions(options) {
		options = super._initializeApplicationOptions(options);
		options.uniqueId = `${this.constructor.name}`;
		return options;
	}

	prepSelection(key) {
		const path = `${this.path}.${key}`;
		const data = settingData(path);
		const { name, hint } = data;
		const selected = sGet(path);
		const select = Object.entries(data.choices).map(([key, value]) => ({ key, value }));
		return { select, name, hint, selected };
	}

	prepSetting(key) {
		const path = `${this.path}.${key}`;
		const { name, hint } = settingData(path);
		return {
			value: sGet(path),
			name,
			hint,
		};
	}

	async resetToDefault(key) {
		const path = `core.${key}`;
		const defaultValue = game.settings.settings.get(`healthEstimate.${path}`).default;
		await game.settings.set("healthEstimate", path, defaultValue);
		if (game.healthEstimate.alwaysShow) canvas.scene?.tokens.forEach((token) => token.object.refresh());
	}

	/**
	 * Executes on form submission
	 * @param {Event} event - the form submission event
	 * @param {Object} formData - the form data
	 */
	async _updateObject(event, formData) {
		await Promise.all(
			Object.entries(formData).map(async ([key, value]) => {
				let current = game.settings.get("healthEstimate", `core.${key}`);
				// eslint-disable-next-line eqeqeq
				if (value != current) await sSet(`core.${key}`, value);
			})
		);
		if (game.healthEstimate.alwaysShow) canvas.scene?.tokens.forEach((token) => token.object.refresh());
	}
}