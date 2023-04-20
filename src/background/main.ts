// Background Script Code

chrome.tabs.onCreated.addListener(async (tab) => await createTab(tab));

const EXCLUDED_URL = [
	"chrome://",
	"chrome-extension://",
	"edge://",
	"extensions://",
];

function checkNativeUrl(url) {
	return EXCLUDED_URL.some((item) => url.includes(item));
}

function UnGroup(tab) {
	const tabIds = parseInt(tab);
	chrome.tabs.ungroup(tabIds, () => {
		// console.log("tab was ungrouped")
	});
}

async function createTab(newtab) {
	// console.log("new tab created");

	// workaround for tab sometimes not having pending or url for some some seconds.
	// let tab = newtab;
	// try {
	const tab = await chrome.tabs.get(newtab.id);
	// } catch (error) {}

	let getout = false;
	let newGroup = true;
	let maximumAchieved = false;
	// to stop propagating the function

	const options = {
		tabIds: [tab.id, tab.openerTabId],
	};

	//getting the original tab to see if it's a member of a group already, for some reason the groupId in tab was always set to -1
	let getTabPromise;
	try {
		getTabPromise = await chrome.tabs.get(tab?.openerTabId);
		// console.log("opener tab info", getTabPromise);
		if (getTabPromise.pinned) return;
	} catch (error) {
		// console.log(error);
	}

	//if the tab is pinned, don't create a tab group from it

	//check if the original tab is pinned
	// let sipt = await shouldIgnorePinnedTab(getTabPromise.pinned);
	// if (sipt) return;

	// checking if a blocking ruke exist if yes stop running the function
	const blockFound = await withBlock(getTabPromise?.url);
	if (blockFound) {
		// it is possible that a blocksite can be opened from an already existing group, in that case it will be
		// part of a group already, so this function will exit, and wont let maximum calculation to happen
		// console.log("block found");
		try {
			UnGroup(tab.id);
		} catch (error) {}
		return;
	}

	//checking if it is not included in a group, else creates a new group
	if (getTabPromise?.groupId !== -1) {
		options.groupId = getTabPromise?.groupId;
		newGroup = false;
	}
	// console.log(newGroup, "new group");
	// console.log(options);

	// checking maximum limitation

	const maximumPropmise = await chrome.storage.sync.get(["maximum"]);

	if (maximumPropmise.maximum && parseInt(maximumPropmise.maximum) > 1) {
		if (!newGroup) {
			//checking if its a new group
			const tabsNumber = await getSingleGroupNumberOfTab(
				getTabPromise?.groupId
			);
			// console.log("number of tabs", tabsNumber, maximumPropmise.maximum);

			if (tabsNumber > parseInt(maximumPropmise.maximum)) {
				// console.log("no group should be created");
				maximumAchieved = true;

				// chrome will include the tab in the existing group anyway, so we have to ungroup it manually
				UnGroup(tab.id);
			}
		}
	}

	try {
		// checking if any of the url exists at all first, sometimes the urls are empty but it still gets a name :S
		// console.log("I was run", tab, maximumAchieved);
		// const newnewtab = await chrome.tabs.get(tab.id);
		// console.log("new  new tab after", tab);
		// ?? should also check origin url

		if (
			(tab.url || tab.pendingUrl) &&
			!checkNativeUrl(tab.pendingUrl ?? tab.url) &&
			!checkNativeUrl(getTabPromise?.url) &&
			!maximumAchieved
		) {
			// console.log("max ach", maximumAchieved);
			//excluding all native chrome protocol pages
			// has side effects. looks like some time tabs are opened without having a pendingURL property
			// results in error when pendingUrl is not found while opening the tab directly.
			// this can however be used to control whether tab group should be created by right clicking or just by target _blank

			const groupByPropmise = await chrome.storage.sync.get(["groupby"]);
			const originalURL = getTabPromise?.url;
			const newUrl = tab.pendingUrl ?? tab.url;
			if (
				groupByPropmise.groupby === "sd" &&
				getHostname(originalURL) !== getHostname(newUrl)
			) {
				// console.log("true, domain didnt match");
				getout = true;
				// this will be uncommented, it will prevent tab from being group together if they are not from the same domain when sd is on
				// question is where to put this check??
			}
			if (getout) {
				// let tabIds = tab.id;

				const regardlessPropmise = await chrome.storage.sync.get([
					"regardless",
				]);
				// console.log("regardless", regardlessPropmise);
				if (regardlessPropmise?.regardless !== true) {
					UnGroup(tab.id);
				}
				// now I have option to combine new tab from a group to always be in the group regardless of domain
				// to be implemented. IMPLEMENTED!
				return;
				// by default chrome will group the tab anyway if it was opened from a group, NOT ANYMORE
			}
			//creating the group
			const groupId = await chrome.tabs.group(options); //returns group id
			// console.log(groupId);

			// this should be executed if there is no group name already. DONE!!

			//checking if a title exists already
			const existingTabGroup = await chrome.tabGroups.get(groupId);

			if (!existingTabGroup.title) {
				// custom rule checking
				// this should be based on original tab or new tab??
				const crule = await withCustomRule(getTabPromise.url);

				// console.log(crule, "custom rule clog");

				let tabgroupName: string;
				let color: string;
				let updateProperties;

				if (crule) {
					tabgroupName = crule.alias;
					color = crule.color;
				} else {
					tabgroupName = await getDomain(
						getTabPromise.pendingUrl ?? getTabPromise.url
					); //getting original tab's url and checking if it's pending
				}

				// console.log(tabgroupName);

				if (color) {
					updateProperties = {
						title: tabgroupName,
						color: color,
					};
				} else {
					updateProperties = {
						title: tabgroupName,
					};
				}
				// updating the group after creation
				try {
					const groupUpdated = await chrome.tabGroups.update(
						groupId,
						updateProperties
					);
					// console.log(groupUpdated);
				} catch (error) {
					// console.log(error, groupId, tabgroupName);
				}
			}
		}
	} catch (error) {
		// console.log("55", error);

		if (
			error ==
			"Error: Tabs cannot be edited right now (user may be dragging a tab)."
		) {
			setTimeout(() => createTab(tab), 50);
		}
	}
}

async function getDomain(url) {
	const domain = new URL(url).hostname;
	const fragments = domain.split(".");
	// console.log("url pieces", fragments);
	// let groupname = justDomain();
	const groupnamePropmise = await chrome.storage.sync.get(["naming"]);
	// console.log(groupnamePropmise);

	switch (groupnamePropmise.naming) {
		case "dom":
			return justDomain();

		case "subdom":
			return fragments.length > 2
				? fragments[0] + "." + fragments[1]
				: fragments[0];

		case "subdomtld":
			return domain;

		default:
			return justDomain();
	}

	function justDomain() {
		if (fragments.length > 2) {
			return fragments[1];
		}
		return fragments[0];
	}
}

function getHostname(url: string) {
	return new URL(url).hostname;
}

async function withCustomRule(url: string) {
	try {
		const rules = await chrome.storage.sync.get(["customrules"]);
		// console.log(rules?.customrules);
		const rule = rules?.customrules?.find(
			(item) => getHostname(item.url) === getHostname(url)
		);

		return rule;
	} catch (error) {
		// console.log(error);
		return false;
	}
}

async function withBlock(url) {
	try {
		const rules = await chrome.storage.sync.get(["blocklist"]);
		// console.log(rules?.blocklist);
		const rule = rules?.blocklist?.find(
			(item) => getHostname(item.blockedUrl) === getHostname(url)
		);

		return rule;
	} catch (error) {
		// console.log(error);
		return false;
	}
}

async function getSingleGroupNumberOfTab(tabGroupId) {
	const queryInfo = {
		groupId: tabGroupId,
	};
	const tabNumbers = await chrome.tabs.query(queryInfo);
	return tabNumbers.length;
}

// group event related

// chrome.tabGroups.onUpdated.addListener(async (tabGroup) => {
// 	const queryInfo = {
// 		groupId: tabGroup.id,
// 	};
// 	const tabs = await chrome.tabs.query(queryInfo);

// 	console.log(tabs, "tab length");

// 	if (tabs.length > 2) {
// 		// const lonelyPromise = await chrome.storage.sync.get(["lonely"]);
// 		// if (lonelyPromise?.lonely === true) {
// 		// 	let tabIds = tabs[0].id;
// 		// 	chrome.tabs.ungroup(tabIds, () =>
// 		// 	);
// 		// }
// 		const tabIds = parseInt(tabs[-1].id);
// 		await chrome.tabs.ungroup(tabIds);

// 		console.log("extra tab was ungrouped");
// 	}
// });

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
	// console.log("220", removeInfo);

	const lonely = await chrome.storage.sync.get(["lonely"]);
	if (!lonely.lonely) return;

	const queryInfo = {
		windowId: -2,
	};

	const tabGroups = await chrome.tabGroups.query(queryInfo);
	// console.log(tabGroups);

	let isLonely = false;
	// tabGroups.some(async (item) => await isGroupNotLonely(item.id));
	// while (!isLonely) {
	tabGroups.forEach(async (item) => {
		isLonely = await isGroupNotLonely(item.id);
	});
	// }
});

async function isGroupNotLonely(tabGroupId) {
	const queryInfo = {
		groupId: tabGroupId,
	};
	const tabNumbers = await chrome.tabs.query(queryInfo);
	// console.log("223", tabNumbers);
	if (tabNumbers.length === 1) {
		//ungrouping the tab:
		const tabIds = parseInt(tabNumbers[0].id);
		const a = await chrome.tabs.ungroup(tabIds);
		// console.log("lonely group unlonlied", a);

		return true;
	}
	// console.log("this group is not lonely", tabGroupId);
	return false;
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
	//check if I should autocollapse tabs in the groups

	const autocollapse = await chrome.storage.sync.get(["autocollapse"]);

	if (!autocollapse.autocollapse) return; //we don't have to do anything

	//handle if current tab is already inside a tabgroup

	const currentTab = await getCurrentTab();

	const currentTabGroup = currentTab.groupId;
	//if currentTab.groupInfo === -1, the tab is not part of any tab groups

	// console.log(activeInfo, currentTab);

	//find tabs in tabGroups
	const queryInfo = {
		windowId: -2,
	};
	const tabGroups = await chrome.tabGroups.query(queryInfo);

	// console.log("tabgroups", tabGroups);

	for (const group of tabGroups) {
		if (group.id === currentTabGroup || group.collapsed) {
			continue;
		}
		const groupId = group.id;
		const updateProperties = {
			collapsed: true,
		};

		try {
			// console.log("collapsing group", groupId, group.title);
			await chrome.tabGroups.update(groupId, updateProperties);
		} catch (error) {
			if (
				error ==
				"Error: Tabs cannot be edited right now (user may be dragging a tab)."
			) {
				setTimeout(() => collapseTabGroup(groupId), 200); //closing this after 0.2 seconds
			}
		}
	} //for of
	// in that case, don't close that
});

async function collapseTabGroup(groupId) {
	// console.log("fallback close group", groupId);
	const updateProperties = {
		collapsed: true,
	};
	await chrome.tabGroups.update(groupId, updateProperties);
}

async function getCurrentTab() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	// `tab` will either be a `tabs.Tab` instance or `undefined`.
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

// async function shouldIgnorePinnedTab(originalTabIsPinned) {
// 	if (originalTabIsPinned) return false;
// }
