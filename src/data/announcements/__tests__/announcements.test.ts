import { describe, it, expect } from 'vitest';
import { parseAnnouncementFile } from '../index';

const sampleMd = `---
version: "1.0.0"
date: "2026-04-01"
title: 测试公告
title_en: Test Announcement
---

- 新增功能 A
- 修复 Bug B

<!-- en -->

- Added feature A
- Fixed bug B
`;

const noEnglishMd = `---
version: "0.9.0"
date: "2026-03-15"
title: 仅中文
title_en: Chinese only
---

- 仅中文内容
`;

describe('parseAnnouncementFile', () => {
  it('parses frontmatter fields', () => {
    const result = parseAnnouncementFile(sampleMd);
    expect(result.version).toBe('1.0.0');
    expect(result.date).toBe('2026-04-01');
    expect(result.title.zh).toBe('测试公告');
    expect(result.title.en).toBe('Test Announcement');
  });

  it('splits bilingual content by <!-- en --> marker', () => {
    const result = parseAnnouncementFile(sampleMd);
    expect(result.content.zh).toContain('新增功能 A');
    expect(result.content.zh).not.toContain('Added feature A');
    expect(result.content.en).toContain('Added feature A');
    expect(result.content.en).not.toContain('新增功能 A');
  });

  it('renders markdown to HTML', () => {
    const result = parseAnnouncementFile(sampleMd);
    expect(result.content.zh).toContain('<li>');
    expect(result.content.en).toContain('<li>');
  });

  it('falls back to zh content when no en marker', () => {
    const result = parseAnnouncementFile(noEnglishMd);
    expect(result.content.zh).toContain('仅中文内容');
    expect(result.content.en).toContain('仅中文内容');
  });

  it('throws on missing frontmatter', () => {
    expect(() => parseAnnouncementFile('no frontmatter here')).toThrow('missing frontmatter');
  });
});
