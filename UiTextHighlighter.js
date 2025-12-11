/**
 * UI 텍스트 하이라이터 클래스
 * 
 * CSS Custom Highlight API 를 통해 지정된 문자열을 DOM 내에서 하이라이트합니다.
 * 
 * @class UiTextHighlighter
 */
class UiTextHighlighter {
    /** @type {HTMLElement | Document | Element | null} */
    root = null;

    /** @type {string} */
    cssHighlightName = 'ui-text-highlighter';

    /** @type {string} */
    targetSelector = '*';

    
    /** @type {string} */
    static cssHighlightName = 'ui-text-highlighter';

    /** @type {string} */
    static targetSelector = '*';

    

    /**
     * @constructor
     * @param {HTMLElement | Document | Element} root - 하이라이트 대상이 되는 루트 노드
     * @throws {Error} CSS Custom Highlight API 미지원 브라우저에서 오류 발생
     */
    constructor(root) {
        if (!CSS.highlights) {
            throw new Error("CSS Custom Highlight API not supported.");
        }
        this.root = root;
        this.cssHighlightName = this.constructor.cssHighlightName;
        this.targetSelector = this.constructor.targetSelector;
    }

    /**
     * TreeWalker를 이용해 하이라이트 대상 텍스트 노드를 찾습니다.
     *
     * @static
     * @param {HTMLElement|Document|Element} root - 탐색할 루트
     * @param {string} [targetSelector=this.targetSelector] - 부모 요소 매칭 셀렉터
     * @returns {Text[]} 텍스트 노드 배열
     */
    static getTargetNodes(root, targetSelector = this.targetSelector) {
        if (targetSelector === null) {
            targetSelector = this.targetSelector;
        }

        const treeWalker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(textNode) {
                    if (textNode.parentElement.matches(targetSelector)) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_REJECT;
                }
            }
        );

        const nodes = [];
        let currentNode = treeWalker.nextNode();

        while (currentNode) {
            nodes.push(currentNode);
            currentNode = treeWalker.nextNode();
        }

        return nodes;
    }

    /**
     * 인스턴스 루트 기준으로 하이라이트 대상 텍스트 노드를 반환합니다.
     *
     * @param {string} [targetSelector=this.targetSelector]
     * @returns {Text[]}
     */
    getTargetNodes(targetSelector = this.targetSelector) {
        return this.constructor.getTargetNodes(this.root, targetSelector = this.targetSelector);
    }

    /**
     * 문자열(또는 문자열 배열)을 root 안에서 찾아 하이라이트합니다.
     *
     * @static
     * @param {HTMLElement|Document|Element} root - 대상 루트
     * @param {string|string[]} strs - 검색할 문자열 또는 문자열 배열
     * @param {string} [cssHighlightName=this.cssHighlightName] - highlight 이름
     * @param {string} [targetSelector=this.targetSelector] - 타겟 제한 선택자
     * @returns {void}
     */
    static highlight(root, strs, cssHighlightName = this.cssHighlightName, targetSelector = this.targetSelector ) {
        if (!CSS.highlights) {
            throw new Error("CSS Custom Highlight API not supported.");
        }
        if (cssHighlightName === null) {
            cssHighlightName = this.cssHighlightName;
        }

        if (!Array.isArray(strs)) {
            strs = [strs];
        }

        const allRanges = [];
        const targetNodes = this.getTargetNodes(root, targetSelector);

        strs.forEach(str => {
            const searchStr = str.trim().toLowerCase();
            if(!searchStr.length){ return }

            const ranges = targetNodes
                .map(el => ({ el, text: el.textContent.toLowerCase() }))
                .map(({ el, text }) => {
                    const indices = [];
                    let startPos = 0;

                    while (startPos < text.length) {
                        const index = text.indexOf(searchStr, startPos);
                        if (index === -1) break;
                        indices.push(index);
                        startPos = index + searchStr.length;
                    }

                    return indices.map(index => {
                        const range = new Range();
                        range.setStart(el, index);
                        range.setEnd(el, index + searchStr.length);
                        return range;
                    });
                });

            allRanges.push(...ranges);
        });

        const searchResultsHighlight = new Highlight(...allRanges.flat());
        CSS.highlights.set(cssHighlightName, searchResultsHighlight);
    }

    /**
     * 인스턴스 root 기준 하이라이트 수행
     *
     * @param {string|string[]} str - 검색할 문자열 또는 문자열 배열
     * @param {string} [cssHighlightName=this.cssHighlightName]
     * @param {string} [targetSelector=this.targetSelector]
     * @returns {void}
     */
    highlight(str, cssHighlightName = this.cssHighlightName , targetSelector = this.targetSelector ) {
        return this.constructor.highlight(this.root, str, cssHighlightName,  targetSelector);
    }

    /**
     * 모든 CSS Highlights 삭제
     *
     * @static
     * @returns {void}
     */
    static clear() {
        CSS.highlights.clear();
    }

    /**
     * 인스턴스 방식으로 highlight clear
     *
     * @returns {void}
     */
    clear() {
        return this.constructor.clear();
    }
}
