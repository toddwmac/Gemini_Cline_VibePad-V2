# Markdown Reference Guide
*Generated on July 10, 2025*

## Table of Contents
- [Standard Markdown](#standard)
- [GitHub](#github)
- [WhatsApp](#whatsapp)
- [Slack](#slack)
- [Discord](#discord)
- [Reddit](#reddit)

## Standard Markdown <a name="standard"></a>
### Headers
```
# H1 → 
# H1
## H2 → 
## H2
### H3 → 
### H3
```

### Emphasis
```
**bold** → **bold**  
*italic* → *italic*  
~~strikethrough~~ → ~~strikethrough~~
```

### Lists
Unordered:
```
- Item 1
- Item 2
  - Subitem
```
→
- Item 1
- Item 2
  - Subitem

Ordered:
```
1. First
2. Second
```
→
1. First
2. Second

### Links
```
[Google](https://google.com)
```
→ [Google](https://google.com)

### Images
```
![Alt text](image.jpg)
```

### Code
Inline: `` `code` `` → `code`

Block:
````
```python
print("Hello World")
```
````
→
```python
print("Hello World")
```

---

## GitHub Flavored Markdown <a name="github"></a>
### Task Lists
```
- [x] Completed task
- [ ] Pending task
```
→
- [x] Completed task
- [ ] Pending task

### Tables
```
| Syntax | Description |
|--------|-------------|
| Header | Title       |
| Cell   | Content     |
```
→
| Syntax | Description |
|--------|-------------|
| Header | Title       |
| Cell   | Content     |

### Mentions
`@username` → @username

---

## WhatsApp <a name="whatsapp"></a>
*Note: Works in chat messages only*
- **Bold**: `*text*` → *text*
- **Italic**: `_text_` → _text_
- **Strikethrough**: `~text~` → ~text~
- **Monospace**: `` `text` `` → `text`

*Limitations:*
- No headers or lists
- No link preview formatting
- No nested formatting

---

## Slack <a name="slack"></a>
- **Bold**: `*text*` → *text*
- **Italic**: `_text_` → _text_
- **Strikethrough**: `~text~` → ~text~
- **Code**: `` `text` `` → `text`
- Block code: ``` ```code``` ``` → 
```
code
```

---

## Discord <a name="discord"></a>
- **Bold**: `**text**` → **text**
- **Italic**: `*text*` → *text*
- **Bold+Italic**: `***text***` → ***text***
- **Underline**: `__text__` → __text__
- **Strikethrough**: `~~text~~` → ~~text~~
- **Spoiler**: `||text||` → ||text||

---

## Reddit <a name="reddit"></a>
### Old Reddit
- **Bold**: `**text**` → **text**
- *Italic*: `*text*` → *text*
- ~~Strikethrough~~: `~~text~~` → ~~text~~
- Superscript: `text^(superscript)` → text^(superscript)

### New Reddit
Supports full CommonMark plus:
- Tables
- Task lists
- Custom emoji: `:emoji_name:`
