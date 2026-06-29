import {
	toolBtnGhostClass,
	toolBtnPrimaryClass,
	toolInputClass,
	toolLabelClass,
	toolSegmentTabClass,
	toolTabBarClass,
} from "@/lib/toolUi";

export const fieldLabelClass = toolLabelClass;

export const inputClass = toolInputClass;

export const tabBarClass = toolTabBarClass;

export function segmentTabClass(active: boolean): string {
	return toolSegmentTabClass(active);
}

export { toolBtnGhostClass, toolBtnPrimaryClass };
