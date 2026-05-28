import * as Groups from './groups.js';

const offListeners = new Set();
const EXTERNAL_GROUP_UPDATE_KEYS = new Set([
    'title',
    'iconUrl',
    'iconColor',
    'iconViewType',
    'isArchive',
    'isSticky',
    'newTabContainer',
]);

export function addListeners() {
    offListeners.add(Groups.on('added', onAdded));
    offListeners.add(Groups.on('updated', onUpdated));
    offListeners.add(Groups.on('removed', onRemoved));
    offListeners.add(Groups.on('loaded', onLoaded));
    offListeners.add(Groups.on('unloaded', onUnloaded));
}

export function removeListeners() {
    offListeners.forEach(off => off());
    offListeners.clear();
}

function send(action, data) {
    self.sendExternalMessage(action, data);
}

function sendMappedGroup(action, group, data = {}) {
    send(action, {
        ...data,
        group: Groups.mapForExternalExtension(group),
    });
}

function onAdded({group, windowId}) {
    sendMappedGroup('group-added', group, {windowId});
}

function hasExternalGroupUpdateKeys(group) {
    return Object.keys(group).some(key => EXTERNAL_GROUP_UPDATE_KEYS.has(key));
}

function onUpdated({group, fullGroup}) {
    if (!hasExternalGroupUpdateKeys(group)) {
        return;
    }

    sendMappedGroup('group-updated', fullGroup);
}

function onRemoved({groupId, windowId}) {
    send('group-removed', {
        groupId,
        windowId,
    });
}

function onLoaded({groupId, windowId}) {
    send('group-loaded', {
        groupId,
        windowId,
    });
}

function onUnloaded({groupId, windowId}) {
    send('group-unloaded', {
        groupId,
        windowId,
    });
}
