export function getActionName(actionType: string) {
    return actionType.split('_').slice(0, -1).join('_');
}
