"use strict";

const contextMenu = (function() {
    const treeEl = $("#tree");

    let clipboardId = null;
    let clipboardMode = null;

    function pasteAfter(node) {
        if (clipboardMode === 'cut') {
            const subjectNode = treeUtils.getNodeByKey(clipboardId);

            treeChanges.moveAfterNode(subjectNode, node);
        }
        else if (clipboardMode === 'copy') {
            treeChanges.cloneNoteAfter(clipboardId, node.data.note_tree_id);
        }
        else {
            throw new Error("Unrecognized clipboard mode=" + mode);
        }

        clipboardId = null;
        clipboardMode = null;
    }

    function pasteInto(node) {
        if (clipboardMode === 'cut') {
            const subjectNode = treeUtils.getNodeByKey(clipboardId);

            treeChanges.moveToNode(subjectNode, node);
        }
        else if (clipboardMode === 'copy') {
            treeChanges.cloneNoteTo(clipboardId, node.data.note_id);
        }
        else {
            throw new Error("Unrecognized clipboard mode=" + mode);
        }

        clipboardId = null;
        clipboardMode = null;
    }

    function copy(node) {
        clipboardId = node.data.note_id;
        clipboardMode = 'copy';
    }

    function cut(node) {
        clipboardId = node.key;
        clipboardMode = 'cut';
    }

    const contextMenuSettings = {
        delegate: "span.fancytree-title",
        autoFocus: true,
        menu: [
            {title: "Insert note here", cmd: "insertNoteHere", uiIcon: "ui-icon-pencil"},
            {title: "Insert child note", cmd: "insertChildNote", uiIcon: "ui-icon-pencil"},
            {title: "Delete", cmd: "delete", uiIcon: "ui-icon-trash"},
            {title: "----"},
            {title: "Protect sub-tree", cmd: "protectSubTree", uiIcon: "ui-icon-locked"},
            {title: "Unprotect sub-tree", cmd: "unprotectSubTree", uiIcon: "ui-icon-unlocked"},
            {title: "----"},
            {title: "Cut", cmd: "cut", uiIcon: "ui-icon-scissors"},
            {title: "Copy / clone", cmd: "copy", uiIcon: "ui-icon-copy"},
            {title: "Paste after", cmd: "pasteAfter", uiIcon: "ui-icon-clipboard"},
            {title: "Paste into", cmd: "pasteInto", uiIcon: "ui-icon-clipboard"}
        ],
        beforeOpen: (event, ui) => {
            const node = $.ui.fancytree.getNode(ui.target);
            // Modify menu entries depending on node status
            treeEl.contextmenu("enableEntry", "pasteAfter", clipboardId !== null);
            treeEl.contextmenu("enableEntry", "pasteInto", clipboardId !== null);

            // Activate node on right-click
            node.setActive();
            // Disable tree keyboard handling
            ui.menu.prevKeyboard = node.tree.options.keyboard;
            node.tree.options.keyboard = false;
        },
        close: (event, ui) => {},
        select: (event, ui) => {
            const node = $.ui.fancytree.getNode(ui.target);

            if (ui.cmd === "insertNoteHere") {
                const parentNoteId = node.data.note_pid;
                const isProtected = treeUtils.getParentProtectedStatus(node);

                noteTree.createNote(node, parentNoteId, 'after', isProtected);
            }
            else if (ui.cmd === "insertChildNote") {
                noteTree.createNote(node, node.data.note_id, 'into');
            }
            else if (ui.cmd === "protectSubTree") {
                protected_session.protectSubTree(node.data.note_id, true);
            }
            else if (ui.cmd === "unprotectSubTree") {
                protected_session.protectSubTree(node.data.note_id, false);
            }
            else if (ui.cmd === "copy") {
                copy(node);
            }
            else if (ui.cmd === "cut") {
                cut(node);
            }
            else if (ui.cmd === "pasteAfter") {
                pasteAfter(node);
            }
            else if (ui.cmd === "pasteInto") {
                pasteInto(node);
            }
            else if (ui.cmd === "delete") {
                treeChanges.deleteNode(node);
            }
            else {
                console.log("Unknown command: " + ui.cmd);
            }
        }
    };

    return {
        pasteAfter,
        pasteInto,
        cut,
        contextMenuSettings
    }
})();