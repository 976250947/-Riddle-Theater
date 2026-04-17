<template>
  <div class="container utility-container">
    <section class="utility-hero studio-hero site-panel">
      <div>
        <div class="utility-kicker">创作中心</div>
        <h1 class="utility-title">把一个故事写成一部可游玩的作品</h1>
        <p class="utility-copy">角色设定、章节节奏、分支图谱和结局条件，都在这里被整理成可持续迭代的创作流程。</p>
      </div>
      <div class="utility-stat-strip">
        <div class="utility-stat">
          <span class="utility-stat-label">当前参考</span>
          <strong>{{ selectedPack.title }}</strong>
        </div>
        <div class="utility-stat">
          <span class="utility-stat-label">已解锁结局</span>
          <strong>{{ unlockedEndings.length }} / {{ endingOrder.length }}</strong>
        </div>
        <div class="utility-stat">
          <span class="utility-stat-label">草稿数</span>
          <strong>{{ totalDraftCount }}</strong>
        </div>
        <div class="utility-stat">
          <span class="utility-stat-label">最近旅程</span>
          <strong>{{ recentJourneyAlias }}</strong>
        </div>
      </div>
    </section>

    <div class="studio-tabs">
      <button
        v-for="tab in studioTabs"
        :key="tab.key"
        :class="['studio-tab', { active: activeTab === tab.key }]"
        type="button"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <section v-if="activeTab === 'projects'" class="utility-grid studio-grid">
      <aside class="site-panel">
        <div class="site-panel-kicker">草稿区</div>
        <h2 class="site-panel-title">当前项目</h2>
        <div class="draft-list">
          <div
            v-for="draft in allDraftCards"
            :key="draft.id"
            :class="['mini-item', 'draft-card', { 'user-draft': !draft.isBuiltin }]"
            :data-draft-id="draft.id"
            :data-builtin="draft.isBuiltin"
            @click="handleDraftClick(draft)"
          >
            <div class="draft-card-header">
              <div class="draft-card-cover" :data-story-theme="draft.uiTheme || 'user'">
                <span v-if="!draft.isBuiltin" class="draft-card-user-icon"><AppIcon name="file" :size="18" /></span>
              </div>
              <div class="draft-card-info">
                <div class="mini-item-title">{{ draft.title }}</div>
                <div class="mini-item-copy">
                  {{ draft.themeLabel }}
                  <template v-if="draft.stages"> · {{ draft.stages }} 章节</template>
                  <template v-if="draft.endingCount"> · {{ draft.endingCount }} 结局</template>
                  <template v-if="draft.templateTitle"> · 基于 {{ draft.templateTitle }}</template>
                </div>
              </div>
            </div>
            <div class="draft-card-right">
              <span :class="['draft-status', `draft-status-${draft.statusClass}`]">{{ draft.status }}</span>
              <div v-if="!draft.isBuiltin" class="draft-card-actions">
                <button class="draft-action-btn" type="button" title="编辑" @click.stop="openDraftDetail(draft.draft)">
                  <AppIcon name="edit" :size="14" />
                </button>
                <button class="draft-action-btn draft-action-delete" type="button" title="删除" @click.stop="confirmDeleteDraft(draft.id)">
                  <AppIcon name="trash" :size="14" />
                </button>
              </div>
            </div>
          </div>
          <div v-if="!allDraftCards.length" class="draft-empty">暂无草稿，点击下方新建或从模板库选择</div>
        </div>
        <button class="studio-new-draft-btn" type="button" @click="openNewDraftModal()">
          <AppIcon name="edit" :size="15" />
          新建草稿
        </button>
      </aside>

      <section class="site-panel studio-center-panel">
        <div class="site-panel-kicker">创作板</div>
        <h2 class="site-panel-title">章节与镜头计划</h2>
        <div class="scene-board">
          <div v-for="step in sceneBoardSteps" :key="step.key" class="scene-board-item">
            <div class="scene-board-header">
              <div class="scene-board-index">第 {{ step.index }} 幕</div>
              <span v-if="step.choiceCount" class="scene-board-choices">{{ step.choiceCount }} 分支</span>
            </div>
            <div class="scene-board-title">{{ step.label }}</div>
            <div class="scene-board-copy">{{ step.objective }}</div>
            <div class="scene-board-tags">
              <span v-for="tag in step.tags" :key="`${step.key}-${tag}`" class="scene-tag">{{ tag }}</span>
            </div>
          </div>
          <p v-if="!sceneBoardSteps.length" class="utility-copy" style="text-align:center;padding:32px 0">当前剧本还没有章节规划。</p>
        </div>
      </section>

      <aside class="site-panel">
        <div class="site-panel-kicker">发布前检查</div>
        <h2 class="site-panel-title">创作清单</h2>
        <div class="checklist-stack">
          <div
            v-for="(item, index) in checklist"
            :key="item.text"
            :class="['checklist-item', { checked: item.done }]"
            @click="toggleChecklist(index)"
          >
              <div class="checklist-icon">
                <AppIcon :name="item.done ? 'check' : 'circle'" :size="14" />
              </div>
            <span>{{ item.text }}</span>
          </div>
        </div>
      </aside>
    </section>

    <section v-if="activeTab === 'templates'" class="studio-template-section">
      <div class="tpl-header-bar">
        <div class="tpl-filter-row">
          <div class="tpl-search-box">
            <span class="tpl-search-icon"><AppIcon name="search" :size="15" /></span>
            <input v-model="templateFilter.search" class="tpl-search-input" type="text" placeholder="搜索模板名称、标签…" />
          </div>
          <div class="tpl-category-tabs">
            <button
              v-for="category in templateCategories"
              :key="category"
              :class="['tpl-cat-btn', { active: templateFilter.category === category }]"
              type="button"
              @click="templateFilter.category = category"
            >
              {{ category === 'all' ? '全部' : category }}
            </button>
          </div>
          <div class="tpl-sort-wrap">
            <select v-model="templateFilter.sort" class="tpl-sort-select">
              <option value="popular">按热度</option>
              <option value="newest">最新</option>
              <option value="difficulty">按难度</option>
            </select>
          </div>
        </div>
      </div>

      <div class="tpl-grid">
        <article v-for="templateItem in filteredTemplates" :key="templateItem.id" class="tpl-card site-panel" @click="openTemplateDetail(templateItem.id)">
          <div class="tpl-card-cover" :style="{ background: templateItem.cover }">
            <span class="tpl-card-cover-icon"><AppIcon :name="templateItem.icon" :size="28" /></span>
            <div class="tpl-card-badges">
              <span class="tpl-badge tpl-badge-uses"><AppIcon name="fire" :size="14" /> {{ formatNumber(templateItem.uses) }} 次使用</span>
              <span class="tpl-badge tpl-badge-rating"><AppIcon name="star-fill" :size="14" /> {{ templateItem.rating }}</span>
            </div>
          </div>
          <div class="tpl-card-body">
            <div class="tpl-card-meta">
              <span class="tpl-card-author"><span class="tpl-card-avatar">{{ templateItem.authorAvatar }}</span>{{ templateItem.author }}</span>
              <span class="tpl-card-difficulty" title="难度">{{ difficultyStars(templateItem.difficulty) }}</span>
            </div>
            <h3 class="tpl-card-title">{{ templateItem.title }}</h3>
            <p class="tpl-card-desc">{{ templateItem.desc }}</p>
            <div class="tpl-card-tags">
              <span v-for="tag in templateItem.tags" :key="`${templateItem.id}-${tag}`" class="tpl-tag">{{ tag }}</span>
            </div>
            <div class="tpl-card-stats">
              <span><AppIcon name="book" :size="14" /> {{ templateItem.structure.chapters }} 章</span>
              <span><AppIcon name="target" :size="14" /> {{ templateItem.structure.endings }} 结局</span>
              <span><AppIcon name="user" :size="14" /> {{ templateItem.structure.characters }} 角色</span>
              <span><AppIcon name="branch-map" :size="14" /> {{ templateItem.structure.branches }} 分支</span>
            </div>
            <div class="tpl-card-actions">
              <button class="tpl-preview-btn" type="button" @click.stop="openTemplateDetail(templateItem.id)">预览详情</button>
              <button class="tpl-use-btn" type="button" @click.stop="useTemplate(templateItem)">使用模板</button>
            </div>
          </div>
        </article>
        <div v-if="!filteredTemplates.length" class="tpl-empty">没有找到匹配的模板，试试其他关键词。</div>
      </div>
    </section>

    <section v-if="activeTab === 'tools'" class="studio-tools-grid">
      <article v-for="tool in studioTools" :key="tool.id" class="tool-card site-panel">
        <div class="tool-icon"><AppIcon :name="tool.icon" :size="30" /></div>
        <div class="tool-body">
          <h3 class="tool-title">{{ tool.title }}</h3>
          <p class="tool-desc">{{ tool.desc }}</p>
        </div>
        <button class="tool-action-btn" type="button" @click="openTool(tool.id)">打开工具</button>
      </article>
    </section>
  </div>

  <Teleport to="body">
    <div v-if="templateDetail.open && selectedTemplate" class="tpl-detail-overlay open" @click.self="closeTemplateDetail">
      <div class="tpl-detail-panel">
        <div class="tpl-detail-header">
          <div class="tpl-detail-title-row">
            <span class="tpl-detail-icon"><AppIcon :name="selectedTemplate.icon" :size="26" /></span>
            <div>
              <h2 class="tpl-detail-title">{{ selectedTemplate.title }}</h2>
              <p class="tpl-detail-subtitle">{{ selectedTemplate.category }} · {{ difficultyStars(selectedTemplate.difficulty) }} · {{ selectedTemplate.structure.chapters }} 章 {{ selectedTemplate.structure.endings }} 结局</p>
            </div>
          </div>
          <button class="tool-panel-close" type="button" aria-label="关闭" @click="closeTemplateDetail">
            <AppIcon name="close" :size="16" />
          </button>
        </div>

        <div class="tpl-detail-body">
          <div class="tpl-d-overview">
            <div class="tpl-d-cover" :style="{ background: selectedTemplate.cover }">
              <span class="tpl-d-cover-icon"><AppIcon :name="selectedTemplate.icon" :size="34" /></span>
            </div>
            <div class="tpl-d-info">
              <div class="tpl-d-meta-row">
                <span class="tpl-d-author"><span class="tpl-card-avatar">{{ selectedTemplate.authorAvatar }}</span>{{ selectedTemplate.author }}</span>
                <span class="tpl-d-meta-sep">·</span>
                <span>难度 {{ difficultyStars(selectedTemplate.difficulty) }}</span>
                <span class="tpl-d-meta-sep">·</span>
                <span><AppIcon name="star-fill" :size="13" /> {{ selectedTemplate.rating }}</span>
                <span class="tpl-d-meta-sep">·</span>
                <span><AppIcon name="fire" :size="13" /> {{ formatNumber(selectedTemplate.uses) }} 次使用</span>
                <span class="tpl-d-meta-sep">·</span>
                <span>更新于 {{ selectedTemplate.updated }}</span>
              </div>
              <p class="tpl-d-synopsis">{{ selectedTemplate.synopsis }}</p>
              <div class="tpl-d-features">
                <span v-for="feature in selectedTemplate.features" :key="feature" class="tpl-d-feature-tag">{{ feature }}</span>
              </div>
            </div>
          </div>

          <div class="tpl-d-tabs">
            <button :class="['tpl-d-tab', { active: templateDetail.tab === 'structure' }]" type="button" @click="templateDetail.tab = 'structure'"><AppIcon name="ruler" :size="14" /> 章节结构</button>
            <button :class="['tpl-d-tab', { active: templateDetail.tab === 'characters' }]" type="button" @click="templateDetail.tab = 'characters'"><AppIcon name="users" :size="14" /> 预设角色</button>
            <button :class="['tpl-d-tab', { active: templateDetail.tab === 'endings' }]" type="button" @click="templateDetail.tab = 'endings'"><AppIcon name="target" :size="14" /> 结局设计</button>
            <button :class="['tpl-d-tab', { active: templateDetail.tab === 'mechanics' }]" type="button" @click="templateDetail.tab = 'mechanics'"><AppIcon name="settings" :size="14" /> 核心机制</button>
          </div>

          <div v-if="templateDetail.tab === 'structure'" class="tpl-d-tabview">
            <div class="tpl-d-chapter-flow">
              <div v-for="(chapter, index) in selectedTemplate.structure.outline" :key="`${selectedTemplate.id}-${chapter.ch}`" class="tpl-d-chapter-node">
                <div class="tpl-d-ch-connector">
                  <div v-if="index < selectedTemplate.structure.outline.length - 1" class="tpl-d-ch-line"></div>
                </div>
                <div class="tpl-d-ch-dot" :style="{ background: chapterTypeColors[chapter.type] || '#d0aa7a' }"><AppIcon :name="chapterTypeIcon(chapter.type)" :size="14" /></div>
                <div class="tpl-d-ch-body">
                  <div class="tpl-d-ch-head">
                    <span class="tpl-d-ch-num">第 {{ chapter.ch }} 章</span>
                    <span class="tpl-d-ch-type" :style="{ color: chapterTypeColors[chapter.type] || '#d0aa7a' }">{{ chapterTypeLabels[chapter.type] || chapter.type }}</span>
                  </div>
                  <h4 class="tpl-d-ch-title">{{ chapter.title }}</h4>
                  <p class="tpl-d-ch-desc">{{ chapter.desc }}</p>
                </div>
              </div>
            </div>
            <div class="tpl-d-structure-summary">
              <div class="tpl-d-summary-card">
                <div class="tpl-d-summary-value">{{ selectedTemplate.structure.chapters }}</div>
                <div class="tpl-d-summary-label">章节</div>
              </div>
              <div class="tpl-d-summary-card">
                <div class="tpl-d-summary-value">{{ selectedTemplate.structure.branches }}</div>
                <div class="tpl-d-summary-label">分支</div>
              </div>
              <div class="tpl-d-summary-card">
                <div class="tpl-d-summary-value">{{ selectedTemplate.structure.endings }}</div>
                <div class="tpl-d-summary-label">结局</div>
              </div>
              <div class="tpl-d-summary-card">
                <div class="tpl-d-summary-value">{{ selectedTemplate.structure.characters }}</div>
                <div class="tpl-d-summary-label">角色</div>
              </div>
            </div>
          </div>

          <div v-if="templateDetail.tab === 'characters'" class="tpl-d-tabview">
            <div class="tpl-d-char-grid">
              <div v-for="character in selectedTemplate.sampleCharacters" :key="`${selectedTemplate.id}-${character.name}`" class="tpl-d-char-card">
                <div class="tpl-d-char-avatar" :style="{ borderColor: roleColors[character.role] || '#d0aa7a' }">{{ character.name[0] }}</div>
                <h4 class="tpl-d-char-name">{{ character.name }}</h4>
                <span class="tpl-d-char-role" :style="{ color: roleColors[character.role] || '#d0aa7a', borderColor: roleColors[character.role] || '#d0aa7a' }">{{ roleLabels[character.role] || character.role }}</span>
                <p class="tpl-d-char-traits">{{ character.traits }}</p>
              </div>
            </div>
          </div>

          <div v-if="templateDetail.tab === 'endings'" class="tpl-d-tabview">
            <div class="tpl-d-ending-grid">
              <div v-for="ending in selectedTemplate.sampleEndings" :key="`${selectedTemplate.id}-${ending.type}`" class="tpl-d-ending-card" :style="{ '--ec': endingColors[ending.type] || '#d0aa7a' }">
                <div class="tpl-d-ending-type" :style="{ color: endingColors[ending.type] || '#d0aa7a' }">{{ endingLabels[ending.type] || ending.type }}</div>
                <h4 class="tpl-d-ending-title">{{ ending.title }}</h4>
                <p class="tpl-d-ending-cond">{{ ending.condition }}</p>
              </div>
            </div>
          </div>

          <div v-if="templateDetail.tab === 'mechanics'" class="tpl-d-tabview">
            <div class="tpl-d-mech-grid">
              <div v-for="mechanic in selectedTemplate.mechanics" :key="`${selectedTemplate.id}-${mechanic.name}`" class="tpl-d-mech-card">
                <div class="tpl-d-mech-icon"><AppIcon :name="mechanic.icon" :size="18" /></div>
                <div class="tpl-d-mech-body">
                  <h4 class="tpl-d-mech-name">{{ mechanic.name }}</h4>
                  <p class="tpl-d-mech-desc">{{ mechanic.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="tpl-d-footer">
            <button class="tpl-d-use-btn" type="button" @click="useTemplate(selectedTemplate)"><AppIcon name="rocket" :size="16" /> 使用此模板创建项目</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="draftModal.open" class="draft-modal-overlay open" @click.self="closeDraftModal">
      <div :class="['draft-modal', { 'draft-modal-lg': draftModal.mode === 'detail' }]">
        <div class="draft-modal-header">
          <h2 class="draft-modal-title"><AppIcon :name="draftModalTitleIcon" :size="18" /> {{ draftModalTitleText }}</h2>
          <button class="tool-panel-close draft-modal-close-btn" type="button" aria-label="关闭" @click="closeDraftModal">
            <AppIcon name="close" :size="16" />
          </button>
        </div>

        <div v-if="draftModal.mode === 'new'" class="draft-modal-body">
          <div v-if="draftModal.templateTitle" class="draft-modal-tpl-badge">模板：{{ draftModal.templateTitle }}</div>
          <label class="draft-modal-label">
            项目名称
            <input v-model="draftModal.title" class="draft-modal-input" type="text" maxlength="50" placeholder="给你的故事起个名字…" />
          </label>
          <label class="draft-modal-label">
            类型
            <select v-model="draftModal.genre" class="draft-modal-select">
              <option v-for="genre in genreOptions" :key="genre" :value="genre">{{ genre }}</option>
            </select>
          </label>
          <label class="draft-modal-label">
            简介 <span class="draft-modal-hint">(可选)</span>
            <textarea v-model="draftModal.desc" class="draft-modal-textarea" rows="3" maxlength="200" placeholder="简单描述你的故事构想…"></textarea>
          </label>
          <div v-if="draftModal.chapters.length || draftModal.characters.length || draftModal.endings.length || draftModal.mechanics.length" class="draft-modal-preview">
            <div class="draft-modal-preview-title">模板预设内容</div>
            <div class="draft-modal-preview-stats">
              <span><AppIcon name="book" :size="14" /> {{ draftModal.chapters.length }} 章节</span>
              <span><AppIcon name="user" :size="14" /> {{ draftModal.characters.length }} 角色</span>
              <span><AppIcon name="target" :size="14" /> {{ draftModal.endings.length }} 结局</span>
              <span><AppIcon name="settings" :size="14" /> {{ draftModal.mechanics.length }} 机制</span>
            </div>
          </div>
        </div>

        <div v-else class="draft-modal-body">
          <div class="draft-detail-meta">
            <span class="draft-detail-genre">{{ draftModal.genre }}</span>
            <span v-if="draftModal.templateTitle" class="draft-detail-from">基于 {{ draftModal.templateTitle }}</span>
            <span class="draft-detail-time">创建于 {{ formatDate(draftModal.createdAt) }} · 更新 {{ timeAgo(draftModal.updatedAt) }}</span>
          </div>
          <p v-if="draftModal.desc" class="draft-detail-desc">{{ draftModal.desc }}</p>

          <div class="draft-detail-sections">
            <div class="draft-detail-section">
              <h3 class="draft-detail-section-title"><AppIcon name="book" :size="15" /> 章节结构 <span class="draft-detail-count">{{ draftModal.chapters.length }}</span></h3>
              <div v-if="draftModal.chapters.length" class="draft-detail-chapter-list">
                <div v-for="(chapter, index) in draftModal.chapters" :key="`${draftModal.draftId}-chapter-${index}`" class="draft-detail-chapter">
                  <span class="draft-detail-ch-num">第 {{ index + 1 }} 章</span>
                  <span class="draft-detail-ch-title">{{ chapter.title }}</span>
                  <span class="draft-detail-ch-type">{{ chapter.type || '' }}</span>
                </div>
              </div>
              <div v-else class="draft-detail-empty">尚未添加章节</div>
            </div>

            <div class="draft-detail-section">
              <h3 class="draft-detail-section-title"><AppIcon name="user" :size="15" /> 角色 <span class="draft-detail-count">{{ draftModal.characters.length }}</span></h3>
              <div v-if="draftModal.characters.length" class="draft-detail-char-list">
                <div v-for="character in draftModal.characters" :key="`${draftModal.draftId}-${character.name}`" class="draft-detail-char">
                  <div class="draft-detail-char-avatar">{{ character.name[0] }}</div>
                  <div>
                    <div class="draft-detail-char-name">{{ character.name }}</div>
                    <div class="draft-detail-char-role">{{ character.role || '' }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="draft-detail-empty">尚未添加角色</div>
            </div>

            <div class="draft-detail-section">
              <h3 class="draft-detail-section-title"><AppIcon name="target" :size="15" /> 结局 <span class="draft-detail-count">{{ draftModal.endings.length }}</span></h3>
              <div v-if="draftModal.endings.length" class="draft-detail-ending-list">
                <div v-for="ending in draftModal.endings" :key="`${draftModal.draftId}-${ending.title}`" class="draft-detail-ending">
                  <span class="draft-detail-ending-type" :style="{ color: endingColors[ending.type] || '#d0aa7a' }">{{ endingLabels[ending.type] || ending.type }}</span>
                  <span class="draft-detail-ending-title">{{ ending.title }}</span>
                </div>
              </div>
              <div v-else class="draft-detail-empty">尚未设计结局</div>
            </div>

            <div v-if="draftModal.mechanics.length" class="draft-detail-section">
              <h3 class="draft-detail-section-title"><AppIcon name="settings" :size="15" /> 核心机制 <span class="draft-detail-count">{{ draftModal.mechanics.length }}</span></h3>
              <div class="draft-detail-mech-list">
                <div v-for="mechanic in draftModal.mechanics" :key="`${draftModal.draftId}-${mechanic.name}`" class="draft-detail-mech">
                  <span class="draft-detail-mech-icon"><AppIcon :name="mechanic.icon" :size="18" /></span>
                  <div>
                    <div class="draft-detail-mech-name">{{ mechanic.name }}</div>
                    <div class="draft-detail-mech-desc">{{ mechanic.desc }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="draft-detail-edit-section">
            <label class="draft-modal-label">
              项目名称
              <input v-model="draftModal.title" class="draft-modal-input" type="text" maxlength="50" />
            </label>
            <label class="draft-modal-label">
              简介
              <textarea v-model="draftModal.desc" class="draft-modal-textarea" rows="2" maxlength="200"></textarea>
            </label>
          </div>
        </div>

        <div class="draft-modal-footer">
          <button v-if="draftModal.mode === 'detail'" class="draft-modal-delete-btn" type="button" @click="confirmDeleteDraft(draftModal.draftId)"><AppIcon name="trash" :size="14" /> 删除草稿</button>
          <div v-if="draftModal.mode === 'detail'" style="flex:1"></div>
          <button class="draft-modal-cancel-btn" type="button" @click="closeDraftModal">{{ draftModal.mode === 'new' ? '取消' : '关闭' }}</button>
          <button class="draft-modal-confirm-btn" type="button" @click="submitDraftModal">{{ draftModal.mode === 'new' ? '创建项目' : '保存修改' }}</button>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="toolPanel.open && selectedTool" class="tool-panel-overlay open" @click.self="closeToolPanel">
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="tool-panel-title-row">
            <span class="tool-panel-icon"><AppIcon :name="selectedTool.icon" :size="22" /></span>
            <h2 class="tool-panel-title">{{ selectedTool.title }}</h2>
          </div>
          <button class="tool-panel-close" type="button" aria-label="关闭" @click="closeToolPanel">
            <AppIcon name="close" :size="16" />
          </button>
        </div>

        <div class="tool-panel-body">
          <div v-if="selectedTool.id === 'character-editor' && activeCharacter" class="tp-char-tabs">
            <button
              v-for="(character, index) in editorCharacters"
              :key="character.characterId || character.name"
              :class="['tp-char-tab', { active: index === activeCharacterIndex }]"
              type="button"
              @click="activeCharacterIndex = index"
            >
              {{ character.name }}
            </button>
            <button class="tp-char-tab tp-char-add" type="button">+ 新角色</button>
          </div>

          <template v-if="selectedTool.id === 'character-editor' && activeCharacter">
            <div v-for="(character, index) in editorCharacters" :key="`${character.characterId || character.name}-panel`" :class="['tp-char-panel', { active: index === activeCharacterIndex }]" v-show="index === activeCharacterIndex">
              <div class="tp-char-grid">
                <div class="tp-char-portrait">
                  <div class="tp-portrait-circle">{{ character.name[0] }}</div>
                  <div class="tp-portrait-id">{{ character.characterId }}</div>
                </div>
                <div class="tp-char-fields">
                  <label class="tp-field">
                    <span class="tp-field-label">角色名称</span>
                    <input v-model="character.name" class="tp-input" type="text" />
                  </label>
                  <label class="tp-field">
                    <span class="tp-field-label">角色定位</span>
                    <input v-model="character.role" class="tp-input" type="text" />
                  </label>
                  <label class="tp-field">
                    <span class="tp-field-label">情绪状态</span>
                    <input v-model="character.mood" class="tp-input" type="text" />
                  </label>
                  <label class="tp-field">
                    <span class="tp-field-label">关系阶段</span>
                    <select v-model="character.relationshipStage" class="tp-select">
                      <option v-for="stage in relationshipStages" :key="stage" :value="stage">{{ stage }}</option>
                    </select>
                  </label>
                  <div class="tp-field-row">
                    <label class="tp-field">
                      <span class="tp-field-label">可见性</span>
                      <select v-model="character.revealed" class="tp-select">
                        <option :value="true">已揭示</option>
                        <option :value="false">隐藏</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div class="tp-char-stats">
                <h4 class="tp-section-title">属性数值</h4>
                <div class="tp-stat-sliders">
                  <div class="tp-slider-row">
                    <span class="tp-slider-label">好感度</span>
                    <input v-model.number="character.affinity" class="tp-slider" type="range" min="0" max="100" style="--slider-color: #e8a87c" />
                    <span class="tp-slider-value">{{ character.affinity }}</span>
                  </div>
                  <div class="tp-slider-row">
                    <span class="tp-slider-label">信任值</span>
                    <input v-model.number="character.trust" class="tp-slider" type="range" min="0" max="100" style="--slider-color: #85cdca" />
                    <span class="tp-slider-value">{{ character.trust }}</span>
                  </div>
                  <div class="tp-slider-row">
                    <span class="tp-slider-label">警觉度</span>
                    <input v-model.number="character.alertness" class="tp-slider" type="range" min="0" max="100" style="--slider-color: #d291bc" />
                    <span class="tp-slider-value">{{ character.alertness }}</span>
                  </div>
                </div>
              </div>

              <div class="tp-char-relations">
                <h4 class="tp-section-title">关系网络</h4>
                <div class="tp-relation-map">
                  <div v-for="otherCharacter in otherCharacters(index)" :key="`${character.characterId}-${otherCharacter.characterId}`" class="tp-relation-line">
                    <span class="tp-relation-node">{{ character.name[0] }}</span>
                    <span class="tp-relation-edge">
                      <select class="tp-select tp-select-sm">
                        <option>信任</option>
                        <option>猜忌</option>
                        <option>合作</option>
                        <option>对抗</option>
                        <option>暧昧</option>
                        <option>未知</option>
                      </select>
                    </span>
                    <span class="tp-relation-node">{{ otherCharacter.name[0] }}</span>
                    <span class="tp-relation-name">{{ otherCharacter.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="selectedTool.id === 'branch-map'">
            <div class="tp-branch-legend">
              <span class="tp-legend-item"><span class="tp-legend-dot tp-dot-stage"></span>叙事节点</span>
              <span class="tp-legend-item"><span class="tp-legend-dot tp-dot-choice"></span>选择分支</span>
              <span class="tp-legend-item"><span class="tp-legend-dot tp-dot-ending"></span>结局触发</span>
              <span class="tp-legend-item"><span class="tp-legend-dot tp-dot-checkpoint"></span>关键存档点</span>
            </div>
            <div class="tp-branch-flow">
              <template v-for="(entry, index) in branchStages" :key="entry.stageId">
                <div :class="['tp-branch-node', { checkpoint: entry.stage.isCheckpoint }]">
                  <div class="tp-branch-node-head">
                    <span class="tp-branch-idx">{{ index + 1 }}</span>
                    <div>
                      <div class="tp-branch-stage-title">{{ entry.stage.title || entry.stageId }}</div>
                      <div class="tp-branch-stage-tag">{{ [entry.stage.chapterTag, entry.stage.sceneTag].filter(Boolean).join(' ') }}</div>
                    </div>
                    <span v-if="entry.stage.isCheckpoint" class="tp-branch-checkpoint-badge">存档点</span>
                  </div>
                  <div v-if="entry.stage.objective" class="tp-branch-objective">{{ entry.stage.objective }}</div>
                  <div v-if="entry.stage.choices?.length" class="tp-branch-choices">
                    <div v-for="choice in entry.stage.choices" :key="choice.id || choice.label" :class="['tp-branch-choice', { 'ending-trigger': choice.ending }]">
                      <div class="tp-branch-choice-label">{{ choice.label }}</div>
                      <div class="tp-branch-choice-meta">
                        <span class="tp-choice-intent">{{ choice.intent || choice.id }}</span>
                        <span v-if="choice.nextStageId" class="tp-choice-arrow"><AppIcon name="arrow-up-right" :size="12" /> {{ choice.nextStageId }}</span>
                        <span v-if="choice.ending" class="tp-choice-ending"><AppIcon name="flag" :size="12" /> 触发结局</span>
                      </div>
                      <div v-if="flattenChoiceEffects(choice.effects).length" class="tp-branch-effects">
                        <span v-for="effect in flattenChoiceEffects(choice.effects)" :key="effect.key" :class="['tp-effect-tag', effect.positive ? 'positive' : 'negative']">{{ effect.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="index < branchStages.length - 1" class="tp-branch-connector"><div class="tp-connector-line"></div></div>
              </template>
            </div>
          </template>

          <template v-if="selectedTool.id === 'dialogue-writer'">
            <div class="tp-dialogue-layout">
              <aside class="tp-dialogue-sidebar">
                <div class="tp-section-title">角色列表</div>
                <div class="tp-dialogue-char-list">
                  <div v-for="speaker in dialogueSpeakers" :key="speaker.characterId" class="tp-dialogue-char-item" :data-char="speaker.characterId">
                    <span class="tp-dialogue-char-dot"></span>
                    <span>{{ speaker.name }}</span>
                  </div>
                </div>

                <div class="tp-section-title" style="margin-top:16px">情绪标签</div>
                <div class="tp-mood-tags">
                  <button v-for="mood in moodTags" :key="mood" class="tp-mood-tag" type="button" @click="dialogueForm.mood = mood">{{ mood }}</button>
                </div>

                <div class="tp-section-title" style="margin-top:16px">语气提示</div>
                <div class="tp-tone-list">
                  <button v-for="tone in toneTags" :key="tone" class="tp-tone-tag" type="button" @click="appendTone(tone)">{{ tone }}</button>
                </div>
              </aside>

              <section class="tp-dialogue-main">
                <div class="tp-dialogue-toolbar">
                  <select v-model="dialogueForm.speaker" class="tp-select">
                    <option v-for="speaker in dialogueSpeakers" :key="speaker.characterId" :value="speaker.characterId">{{ speaker.name }}</option>
                  </select>
                  <select v-model="dialogueForm.mood" class="tp-select">
                    <option value="">选择情绪…</option>
                    <option v-for="mood in moodTags.slice(0, 7)" :key="`toolbar-${mood}`" :value="mood">{{ mood }}</option>
                  </select>
                  <button class="tp-btn tp-btn-secondary" type="button" @click="insertDialogueLine">+ 添加对白</button>
                </div>

                <div class="tp-dialogue-canvas">
                  <template v-for="(scene, sceneIndex) in dialogueScenes" :key="scene.id">
                    <div class="tp-dialogue-scene-divider">{{ scene.stageTitle }}</div>
                    <div v-for="(line, lineIndex) in scene.lines" :key="line.id" :class="['tp-dialogue-bubble', line.isNarrator ? 'narrator' : 'character']">
                      <div class="tp-bubble-speaker">{{ line.speakerName }}<template v-if="line.mood"> [{{ line.mood }}]</template></div>
                      <div class="tp-bubble-text" contenteditable="true" @blur="updateDialogueText(sceneIndex, lineIndex, $event)">{{ line.text }}</div>
                      <div class="tp-bubble-actions">
                        <button class="tp-bubble-btn" type="button" title="删除" @click="removeDialogueLine(sceneIndex, lineIndex)"><AppIcon name="close" :size="12" /></button>
                        <button class="tp-bubble-btn" type="button" title="上移" @click="moveDialogueLine(sceneIndex, lineIndex, -1)"><AppIcon name="arrow-up" :size="12" /></button>
                        <button class="tp-bubble-btn" type="button" title="下移" @click="moveDialogueLine(sceneIndex, lineIndex, 1)"><AppIcon name="arrow-down" :size="12" /></button>
                      </div>
                    </div>
                  </template>
                </div>

                <div class="tp-dialogue-input-row">
                  <textarea v-model="dialogueForm.text" class="tp-textarea" rows="2" placeholder="在这里输入对白内容…"></textarea>
                  <button class="tp-btn" type="button" @click="insertDialogueLine">插入</button>
                </div>
              </section>
            </div>
          </template>

          <template v-if="selectedTool.id === 'ending-config'">
            <div class="tp-ending-grid">
              <article v-for="ending in endingEntries" :key="ending.id" class="tp-ending-card" :style="{ '--ending-color': ending.color }">
                <div class="tp-ending-header">
                  <span class="tp-ending-badge">{{ ending.label }}</span>
                  <span class="tp-ending-code">{{ ending.code || ending.id }}</span>
                </div>
                <h3 class="tp-ending-title">{{ ending.title }}</h3>
                <p class="tp-ending-subtitle">{{ ending.subtitle }}</p>
                <div class="tp-ending-conditions">
                  <div class="tp-section-title">触发条件</div>
                  <div v-for="condition in ending.conditions" :key="condition.key" class="tp-condition-row">
                    <input class="tp-input tp-input-sm" type="text" :value="condition.label" readonly />
                    <input class="tp-input tp-input-sm" type="text" :value="condition.value" readonly />
                    <button class="tp-btn-icon" type="button" title="删除"><AppIcon name="close" :size="12" /></button>
                  </div>
                  <button class="tp-btn tp-btn-secondary tp-btn-sm" type="button">+ 添加条件</button>
                </div>
                <div class="tp-ending-flags">
                  <div class="tp-section-title">关联线索</div>
                  <div class="tp-flag-chips">
                    <label v-for="(clue, clueIndex) in clueEntries" :key="`${ending.id}-${clue.id || clue.title}`" class="tp-flag-chip">
                      <input type="checkbox" :checked="isSuggestedClue(ending.id, clueIndex)" />
                      <span>{{ clue.title }}</span>
                    </label>
                  </div>
                </div>
              </article>
            </div>

            <div class="tp-ending-variables">
              <h4 class="tp-section-title">全局变量阈值</h4>
              <div class="tp-var-grid">
                <div v-for="variable in endingThresholds" :key="variable.key" class="tp-var-card">
                  <div class="tp-var-title">{{ variable.label }}</div>
                  <div class="tp-var-rules">
                    <div v-for="rule in variable.thresholds" :key="rule" class="tp-var-rule">{{ rule }}</div>
                  </div>
                  <div class="tp-var-slider-row">
                    <input v-model.number="endingPreviewValues[variable.key]" class="tp-slider" type="range" min="0" max="100" style="--slider-color: var(--gold-main)" />
                    <span class="tp-slider-value">{{ endingPreviewValues[variable.key] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="selectedTool.id === 'script-tester'">
            <div class="tp-tester-layout">
              <aside class="tp-tester-sidebar">
                <div class="tp-section-title">模拟状态</div>
                <div class="tp-tester-state">
                  <div v-for="character in testerCharacters" :key="character.characterId" class="tp-tester-char-stat">
                    <div class="tp-tester-char-name">{{ character.name }}</div>
                    <div class="tp-mini-bars">
                      <div class="tp-mini-bar">
                        <span class="tp-mini-label">好感</span>
                        <div class="tp-mini-track"><div class="tp-mini-fill" :style="{ width: `${character.affinity}%`, background: '#e8a87c' }"></div></div>
                        <span class="tp-mini-val">{{ character.affinity }}</span>
                      </div>
                      <div class="tp-mini-bar">
                        <span class="tp-mini-label">信任</span>
                        <div class="tp-mini-track"><div class="tp-mini-fill" :style="{ width: `${character.trust}%`, background: '#85cdca' }"></div></div>
                        <span class="tp-mini-val">{{ character.trust }}</span>
                      </div>
                      <div class="tp-mini-bar">
                        <span class="tp-mini-label">警觉</span>
                        <div class="tp-mini-track"><div class="tp-mini-fill" :style="{ width: `${character.alertness}%`, background: '#d291bc' }"></div></div>
                        <span class="tp-mini-val">{{ character.alertness }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="tp-tester-flags">
                    <div class="tp-section-title" style="margin-top:12px">已触发标记</div>
                    <div class="tp-flag-list">
                      <span v-if="!tester.flags.length" class="tp-flag-empty">尚未触发任何标记</span>
                      <span v-for="flag in tester.flags" :key="flag" class="tp-flag-tag">{{ flag }}</span>
                    </div>
                  </div>

                  <div class="tp-tester-clues">
                    <div class="tp-section-title" style="margin-top:12px">已解锁线索</div>
                    <div class="tp-clue-list">
                      <span v-if="!tester.clues.length" class="tp-flag-empty">尚未解锁线索</span>
                      <span v-for="clue in testerClueTitles" :key="clue" class="tp-clue-tag">{{ clue }}</span>
                    </div>
                  </div>
                </div>

                <button class="tp-btn tp-btn-secondary" type="button" style="margin-top:12px;width:100%" @click="resetTester">重置测试</button>
              </aside>

              <section class="tp-tester-main">
                <div class="tp-tester-log">
                  <div v-for="(entry, index) in tester.logs" :key="`${entry.stageId || 'log'}-${index}`" :class="['tp-tester-entry', entry.type === 'system' ? 'tp-entry-system' : 'tp-entry-choice']">
                    <div class="tp-entry-label">{{ entry.label }}</div>
                    <div v-if="entry.summary" class="tp-entry-summary">{{ entry.summary }}</div>
                    <div v-if="entry.effects" class="tp-entry-effects">{{ entry.effects }}</div>
                    <div v-if="entry.ending" class="tp-entry-ending"><AppIcon name="flag" :size="12" /> 触发结局判定</div>
                    <div v-if="entry.nextStageId" class="tp-entry-next"><AppIcon name="arrow-up-right" :size="12" /> 下一阶段：{{ entry.nextStageId }}</div>
                  </div>
                </div>

                <div class="tp-tester-stages">
                  <div v-for="(entry, index) in branchStages" :key="`tester-${entry.stageId}`" class="tp-tester-stage" :data-test-stage="entry.stageId">
                    <div class="tp-tester-stage-header">
                      <span class="tp-tester-stage-idx">{{ index + 1 }}</span>
                      <span class="tp-tester-stage-title">{{ entry.stage.title || entry.stageId }}</span>
                      <span v-if="entry.stage.isCheckpoint" class="tp-branch-checkpoint-badge">存档</span>
                    </div>
                    <div v-if="entry.stage.choices?.length" class="tp-tester-choices">
                      <button v-for="choice in entry.stage.choices" :key="choice.id || choice.label" class="tp-tester-choice-btn" type="button" @click="applyTestChoice(entry, choice)">
                        <span class="tp-choice-label">{{ choice.label }}</span>
                        <span class="tp-choice-hint">{{ choice.intent || '' }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </template>

          <template v-if="selectedTool.id === 'data-dashboard'">
            <div class="tp-dash-stats">
              <div class="tp-dash-stat-card">
                <div class="tp-dash-stat-value">{{ dashboardStats.totalPlays }}</div>
                <div class="tp-dash-stat-label">总游玩次数</div>
                <div class="tp-dash-stat-trend trend-up"><AppIcon name="arrow-up" :size="12" /> 12.3% 较上周</div>
              </div>
              <div class="tp-dash-stat-card">
                <div class="tp-dash-stat-value">{{ dashboardStats.avgDuration }}</div>
                <div class="tp-dash-stat-label">平均游戏时长</div>
                <div class="tp-dash-stat-trend trend-same">— 持平</div>
              </div>
              <div class="tp-dash-stat-card">
                <div class="tp-dash-stat-value">{{ dashboardStats.completionRate }}%</div>
                <div class="tp-dash-stat-label">通关完成率</div>
                <div class="tp-dash-stat-trend trend-up"><AppIcon name="arrow-up" :size="12" /> 3.1%</div>
              </div>
              <div class="tp-dash-stat-card">
                <div class="tp-dash-stat-value">{{ endingEntries.length }}</div>
                <div class="tp-dash-stat-label">可达结局数</div>
                <div class="tp-dash-stat-trend trend-same">—</div>
              </div>
            </div>

            <div class="tp-dash-panels">
              <section class="tp-dash-panel">
                <h4 class="tp-section-title">结局分布</h4>
                <div class="tp-dash-ending-bars">
                  <div v-for="ending in dashboardEndingDistribution" :key="ending.id" class="tp-dash-bar-row">
                    <span class="tp-dash-bar-label">{{ ending.label }}</span>
                    <div class="tp-dash-bar-track">
                      <div class="tp-dash-bar-fill" :style="{ width: `${ending.percentage}%`, background: ending.color }"></div>
                    </div>
                    <span class="tp-dash-bar-value">{{ ending.percentage }}%</span>
                  </div>
                </div>
              </section>

              <section class="tp-dash-panel">
                <h4 class="tp-section-title">各节点选择倾向</h4>
                <div class="tp-dash-choice-stats">
                  <div v-for="stage in dashboardChoiceStats" :key="stage.stageId" class="tp-dash-stage-row">
                    <div class="tp-dash-stage-name">{{ stage.stageTitle }}</div>
                    <div class="tp-dash-choice-bars">
                      <div v-for="choice in stage.choices" :key="`${stage.stageId}-${choice.label}`" class="tp-dash-choice-row">
                        <span class="tp-dash-choice-label">{{ choice.label }}</span>
                        <div class="tp-dash-bar-track small">
                          <div class="tp-dash-bar-fill" :style="{ width: `${choice.percentage}%`, background: 'var(--gold-main)' }"></div>
                        </div>
                        <span class="tp-dash-bar-value">{{ choice.percentage }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div class="tp-dash-panels">
              <section class="tp-dash-panel">
                <h4 class="tp-section-title">玩家留存曲线</h4>
                <div class="tp-dash-retention">
                  <div v-for="step in retentionSteps" :key="step.label" class="tp-dash-retention-step">
                    <div class="tp-retention-bar-col">
                      <div class="tp-retention-bar" :style="{ height: `${step.value}%` }"></div>
                    </div>
                    <span class="tp-retention-label">{{ step.label }}</span>
                    <span class="tp-retention-value">{{ step.value }}%</span>
                  </div>
                </div>
              </section>

              <section class="tp-dash-panel">
                <h4 class="tp-section-title">热门路径</h4>
                <div class="tp-dash-paths">
                  <div v-for="(path, index) in dashboardPopularPaths" :key="`${path.ending}-${index}`" class="tp-dash-path-row">
                    <span class="tp-dash-path-rank">#{{ index + 1 }}</span>
                    <div class="tp-dash-path-body">
                      <div class="tp-dash-path-trail">{{ path.path }}</div>
                      <div class="tp-dash-path-ending">{{ path.ending }} · {{ path.percentage }}% 玩家</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="toast.visible" class="tpl-toast show">{{ toast.message }}</div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { useAuthStore } from "@/stores/auth.js";
import { ENDING_ORDER } from "@runtime/config/constants.js";
import { getStoryDisplay } from "@runtime/config/story-display.js";
import { DEFAULT_STORY_ID, getStoryList, getStoryPack, getUnlockedEndingsForStory } from "@runtime/config/story-packs.js";
import { loadMeta, loadSession } from "@runtime/core/story-storage.js";
import {
  CHAPTER_TYPE_COLORS,
  CHAPTER_TYPE_LABELS,
  DRAFT_STORAGE_KEY,
  ENDING_COLORS,
  ENDING_LABELS,
  GENRE_OPTIONS,
  MOOD_TAGS,
  RELATIONSHIP_STAGES,
  ROLE_COLORS,
  ROLE_LABELS,
  STUDIO_CHECKLIST_ITEMS,
  STUDIO_SELECTED_STORY_KEY,
  STUDIO_TABS,
  STUDIO_TOOLS,
  TEMPLATE_CATEGORIES,
  TEMPLATE_LIBRARY,
  TONE_TAGS,
  difficultyStars
} from "./studio-data.js";

const authStore = useAuthStore();

const endingOrder = ENDING_ORDER;
const studioTabs = STUDIO_TABS;
const studioTools = STUDIO_TOOLS;
const genreOptions = GENRE_OPTIONS;
const templateCategories = TEMPLATE_CATEGORIES;
const moodTags = MOOD_TAGS;
const toneTags = TONE_TAGS;
const relationshipStages = RELATIONSHIP_STAGES;
const endingLabels = ENDING_LABELS;
const endingColors = ENDING_COLORS;
const chapterTypeLabels = CHAPTER_TYPE_LABELS;
const chapterTypeColors = CHAPTER_TYPE_COLORS;
const roleLabels = ROLE_LABELS;
const roleColors = ROLE_COLORS;

const activeTab = ref("projects");
const selectedStoryId = ref(loadSelectedStoryId());
const drafts = ref(loadDrafts());
const meta = ref(readMeta());
const session = ref(readSession());
const checklist = ref(STUDIO_CHECKLIST_ITEMS.map((item) => ({ ...item })));
const templateFilter = reactive({ category: "all", search: "", sort: "popular" });
const templateDetail = reactive({ open: false, templateId: "", tab: "structure" });
const draftModal = reactive(createEmptyDraftModal());
const toolPanel = reactive({ open: false, toolId: "" });
const endingPreviewValues = reactive({ affinity: 50, trust: 50, alertness: 50 });
const dialogueForm = reactive({ speaker: "narrator", mood: "", text: "" });
const tester = reactive({ chars: {}, flags: [], clues: [], logs: [] });
const toast = reactive({ visible: false, message: "" });

const editorCharacters = ref([]);
const activeCharacterIndex = ref(0);
const dialogueScenes = ref([]);

const storyList = getStoryList();
const selectedPack = computed(() => getStoryPack(selectedStoryId.value));
const unlockedEndings = computed(() => getUnlockedEndingsForStory(meta.value, selectedStoryId.value));
const selectedTemplate = computed(() => TEMPLATE_LIBRARY.find((item) => item.id === templateDetail.templateId) || null);
const selectedTool = computed(() => studioTools.find((item) => item.id === toolPanel.toolId) || null);
const recentJourneyAlias = computed(() => authStore.user?.alias || session.value?.player?.alias || "无记录");
const totalDraftCount = computed(() => storyList.length + drafts.value.length);
const draftModalTitleText = computed(() => {
  if (draftModal.mode === "new") {
    return draftModal.templateTitle ? "基于模板创建" : "新建草稿";
  }
  return draftModal.title || "项目详情";
});
const draftModalTitleIcon = computed(() => {
  if (draftModal.mode === "new") {
    return draftModal.templateTitle ? "clipboard" : "edit";
  }
  return "file";
});
const clueEntries = computed(() => Object.values(selectedPack.value.clueLibrary || {}));
const branchStages = computed(() =>
  Object.entries(selectedPack.value.stages || {}).map(([stageId, stage]) => ({ stageId, stage }))
);
const dialogueSpeakers = computed(() => [
  { characterId: "narrator", name: "旁白" },
  { characterId: "player", name: "主角" },
  ...Object.values(selectedPack.value.initialCharacters || {}).map((character) => ({
    characterId: character.characterId,
    name: character.name
  }))
]);
const activeCharacter = computed(() => editorCharacters.value[activeCharacterIndex.value] || null);

const builtInDrafts = computed(() =>
  storyList.map((pack) => {
    const display = getStoryDisplay(pack.id);
    return {
      id: pack.id,
      title: pack.title,
      themeLabel: pack.themeLabel || display.featuredCategory || pack.genre || "剧情叙事",
      stages: Object.keys(pack.stages || {}).length,
      endingCount: Object.keys(pack.endings || {}).length,
      status: pack.id === selectedStoryId.value ? "编辑中" : "内置",
      statusClass: pack.id === selectedStoryId.value ? "active" : "builtin",
      uiTheme: pack.uiTheme || pack.id,
      isBuiltin: true,
      draft: null,
      templateTitle: ""
    };
  })
);

const userDraftCards = computed(() =>
  drafts.value.map((draft) => ({
    id: draft.id,
    title: draft.title,
    themeLabel: draft.genre || "原创",
    stages: Array.isArray(draft.chapters) ? draft.chapters.length : 0,
    endingCount: Array.isArray(draft.endings) ? draft.endings.length : 0,
    status: timeAgo(draft.updatedAt),
    statusClass: "user",
    uiTheme: "user",
    isBuiltin: false,
    draft,
    templateTitle: draft.templateTitle || ""
  }))
);

const allDraftCards = computed(() => [...userDraftCards.value, ...builtInDrafts.value]);

const sceneBoardSteps = computed(() => {
  const pack = selectedPack.value;
  const stageEntries = branchStages.value;
  const progressSteps = Array.isArray(pack.progressSteps) && pack.progressSteps.length
    ? pack.progressSteps
    : stageEntries.map((entry) => ({ label: entry.stage.title || entry.stageId }));

  return progressSteps.map((step, index) => {
    const entry = stageEntries[index] || { stageId: `stage-${index + 1}`, stage: {} };
    return {
      key: entry.stageId,
      index: index + 1,
      label: typeof step === "string" ? step : step.label || step.title || `第 ${index + 1} 幕`,
      objective: entry.stage.objective || entry.stage.title || pack.synopsis || "尚未补充章节目标。",
      choiceCount: Array.isArray(entry.stage.choices) ? entry.stage.choices.length : 0,
      tags: Array.isArray(entry.stage.eventTags) ? entry.stage.eventTags : []
    };
  });
});

const filteredTemplates = computed(() => {
  let list = [...TEMPLATE_LIBRARY];
  const keyword = templateFilter.search.trim().toLowerCase();

  if (templateFilter.category !== "all") {
    list = list.filter(
      (item) => item.category === templateFilter.category || item.tags.includes(templateFilter.category)
    );
  }

  if (keyword) {
    list = list.filter((item) => {
      const haystack = [item.title, item.desc, item.synopsis, ...item.tags].join(" ").toLowerCase();
      return haystack.includes(keyword);
    });
  }

  if (templateFilter.sort === "newest") {
    list.sort((left, right) => right.updated.localeCompare(left.updated));
  } else if (templateFilter.sort === "difficulty") {
    list.sort((left, right) => left.difficulty - right.difficulty);
  } else {
    list.sort((left, right) => right.popularity - left.popularity);
  }

  return list;
});

const endingEntries = computed(() =>
  endingOrder
    .map((endingId) => {
      const ending = selectedPack.value.endings?.[endingId];
      if (!ending) return null;

      return {
        id: endingId,
        label: endingLabels[endingId] || endingId,
        color: endingColors[endingId] || "#d0aa7a",
        title: ending.title || endingId,
        subtitle: ending.subtitle || "根据变量与线索组合触发",
        code: ending.code || endingId,
        conditions: normalizeEndingConditions(ending.conditions)
      };
    })
    .filter(Boolean)
);

const testerCharacters = computed(() =>
  Object.entries(tester.chars).map(([characterId, stats]) => ({ characterId, ...stats }))
);

const testerClueTitles = computed(() =>
  tester.clues.map((clueId) => selectedPack.value.clueLibrary?.[clueId]?.title || clueId)
);

const dashboardStats = computed(() => {
  const display = getStoryDisplay(selectedPack.value.id);
  return {
    totalPlays: formatNumber(parsePlayCount(display.playCount)),
    avgDuration: display.duration || "4h 12m",
    completionRate: Math.min(92, 48 + branchStages.value.length * 4)
  };
});

const dashboardEndingDistribution = computed(() => {
  const percentages = { good: 34, normal: 28, bad: 22, hidden: 16 };
  return endingOrder.map((endingId) => ({
    id: endingId,
    label: endingLabels[endingId] || endingId,
    color: endingColors[endingId] || "#d0aa7a",
    percentage: percentages[endingId] || 0
  }));
});

const dashboardChoiceStats = computed(() =>
  branchStages.value
    .slice(0, 5)
    .map(({ stageId, stage }, stageIndex) => ({
      stageId,
      stageTitle: stage.title || stageId,
      choices: (stage.choices || []).map((choice, choiceIndex) => ({
        label: choice.label,
        percentage: Math.max(18, 46 - choiceIndex * 8 - stageIndex * 3)
      }))
    }))
    .filter((stage) => stage.choices.length)
);

const dashboardPopularPaths = computed(() => {
  const labels = branchStages.value.slice(0, 5).map(({ stage }) => stage.choices?.map((choice) => choice.label) || [stage.title || "推进"]);
  if (!labels.length) return [];

  const buildPath = (offset) =>
    labels
      .map((choices, index) => choices[Math.min(offset, Math.max(choices.length - 1, 0))] || choices[0] || `节点 ${index + 1}`)
      .join(" → ");

  return [
    { path: buildPath(0), ending: endingEntries.value[0]?.label || "好结局", percentage: 34 },
    { path: buildPath(1), ending: endingEntries.value[1]?.label || "普通结局", percentage: 28 },
    { path: buildPath(2), ending: endingEntries.value[2]?.label || "坏结局", percentage: 22 },
    { path: buildPath(3), ending: endingEntries.value[3]?.label || "隐藏结局", percentage: 16 }
  ];
});

const retentionSteps = [
  { label: "第1幕", value: 100 },
  { label: "第2幕", value: 87 },
  { label: "第3幕", value: 72 },
  { label: "第4幕", value: 65 },
  { label: "第5幕", value: 58 }
];

const endingThresholds = [
  { key: "affinity", label: "好感度", thresholds: ["< 30 → 坏结局", "30-67 → 普通", "≥ 68 → 好结局"] },
  { key: "trust", label: "信任值", thresholds: ["< 25 → 坏结局", "25-61 → 普通", "≥ 62 → 好结局"] },
  { key: "alertness", label: "警觉度", thresholds: ["> 80 → 坏结局", "40-80 → 中立", "< 40 → 安全"] }
];

let dialogueLineCounter = 0;
let toastTimer = null;

watch(
  selectedStoryId,
  (storyId) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STUDIO_SELECTED_STORY_KEY, storyId);
    }

    resetCharacterEditor();
    resetDialogueWriter();
    resetTester();
  },
  { immediate: true }
);

watch(
  () => draftModal.open || templateDetail.open || toolPanel.open,
  (isOpen) => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener("storage", handleStorageChange);
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
  }
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
});

function createEmptyDraftModal() {
  return {
    open: false,
    mode: "new",
    draftId: "",
    title: "",
    genre: "原创",
    desc: "",
    templateId: null,
    templateTitle: "",
    chapters: [],
    characters: [],
    endings: [],
    mechanics: [],
    createdAt: "",
    updatedAt: ""
  };
}

function resetDraftModalState() {
  Object.assign(draftModal, createEmptyDraftModal());
}

function loadSelectedStoryId() {
  if (typeof window === "undefined") return DEFAULT_STORY_ID;
  const storedId = localStorage.getItem(STUDIO_SELECTED_STORY_KEY);
  return getStoryList().some((story) => story.id === storedId) ? storedId : DEFAULT_STORY_ID;
}

function loadDrafts() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDrafts(nextDrafts) {
  drafts.value = nextDrafts;
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextDrafts));
}

function readMeta() {
  if (typeof window === "undefined") return { unlockedEndings: [] };
  try {
    return loadMeta();
  } catch {
    return { unlockedEndings: [] };
  }
}

function readSession() {
  if (typeof window === "undefined") return null;
  try {
    return loadSession();
  } catch {
    return null;
  }
}

function handleStorageChange(event) {
  if (event.key === DRAFT_STORAGE_KEY) {
    drafts.value = loadDrafts();
  }

  if (event.key === STUDIO_SELECTED_STORY_KEY) {
    selectedStoryId.value = loadSelectedStoryId();
  }

  if (event.key?.includes("ai-narrative-game-session")) {
    session.value = readSession();
  }

  if (event.key?.includes("ai-narrative-game-meta")) {
    meta.value = readMeta();
  }
}

function timeAgo(dateString) {
  if (!dateString) return "刚刚";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return formatDate(dateString);
}

function formatDate(dateString) {
  if (!dateString) return "未知时间";
  return new Date(dateString).toLocaleDateString("zh-CN");
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("zh-CN");
}

function parsePlayCount(value) {
  if (!value) return 0;
  if (value === "新作") return 12000;
  if (value.includes("万")) {
    return Math.round(Number.parseFloat(value) * 10000);
  }
  return Math.round(Number.parseFloat(String(value).replace(/,/g, "")) || 0);
}

function chapterTypeIcon(type) {
  return {
    intro: "sunrise",
    explore: "search-plus",
    conflict: "lightning",
    climax: "fire",
    resolution: "flag"
  }[type] || "circle";
}

function handleDraftClick(card) {
  if (card.isBuiltin) {
    selectedStoryId.value = card.id;
    return;
  }

  if (card.draft) {
    openDraftDetail(card.draft);
  }
}

function openNewDraftModal(prefill = {}) {
  resetDraftModalState();
  draftModal.open = true;
  draftModal.mode = "new";
  draftModal.title = prefill.title || "";
  draftModal.genre = prefill.genre || "原创";
  draftModal.desc = prefill.desc || "";
  draftModal.templateId = prefill.templateId || null;
  draftModal.templateTitle = prefill.templateTitle || "";
  draftModal.chapters = clone(prefill.chapters || []);
  draftModal.characters = clone(prefill.characters || []);
  draftModal.endings = clone(prefill.endings || []);
  draftModal.mechanics = clone(prefill.mechanics || []);
}

function openDraftDetail(draft) {
  resetDraftModalState();
  draftModal.open = true;
  draftModal.mode = "detail";
  draftModal.draftId = draft.id;
  draftModal.title = draft.title;
  draftModal.genre = draft.genre || "原创";
  draftModal.desc = draft.desc || "";
  draftModal.templateId = draft.templateId || null;
  draftModal.templateTitle = draft.templateTitle || "";
  draftModal.chapters = clone(draft.chapters || []);
  draftModal.characters = clone(draft.characters || []);
  draftModal.endings = clone(draft.endings || []);
  draftModal.mechanics = clone(draft.mechanics || []);
  draftModal.createdAt = draft.createdAt;
  draftModal.updatedAt = draft.updatedAt;
}

function closeDraftModal() {
  resetDraftModalState();
}

function submitDraftModal() {
  if (draftModal.mode === "new") {
    const title = draftModal.title.trim() || "未命名草稿";
    const now = new Date().toISOString();
    const nextDraft = {
      id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title,
      genre: draftModal.genre,
      desc: draftModal.desc.trim(),
      templateId: draftModal.templateId,
      templateTitle: draftModal.templateTitle,
      chapters: clone(draftModal.chapters),
      characters: clone(draftModal.characters),
      endings: clone(draftModal.endings),
      mechanics: clone(draftModal.mechanics),
      createdAt: now,
      updatedAt: now
    };

    saveDrafts([nextDraft, ...drafts.value]);
    closeDraftModal();
    showToast(`已创建项目「${title}」`);
    return;
  }

  const nextDrafts = drafts.value.map((draft) => {
    if (draft.id !== draftModal.draftId) return draft;
    return {
      ...draft,
      title: draftModal.title.trim() || draft.title,
      desc: draftModal.desc.trim(),
      updatedAt: new Date().toISOString()
    };
  });

  saveDrafts(nextDrafts);
  closeDraftModal();
  showToast("已保存修改");
}

function confirmDeleteDraft(draftId) {
  const targetDraft = drafts.value.find((draft) => draft.id === draftId);
  if (!targetDraft) return;

  if (!window.confirm(`确定要删除草稿「${targetDraft.title}」吗？此操作不可撤销。`)) {
    return;
  }

  saveDrafts(drafts.value.filter((draft) => draft.id !== draftId));
  if (draftModal.draftId === draftId) {
    closeDraftModal();
  }
  showToast("已删除草稿");
}

function toggleChecklist(index) {
  checklist.value[index].done = !checklist.value[index].done;
}

function openTemplateDetail(templateId) {
  templateDetail.open = true;
  templateDetail.templateId = templateId;
  templateDetail.tab = "structure";
}

function closeTemplateDetail() {
  templateDetail.open = false;
  templateDetail.templateId = "";
  templateDetail.tab = "structure";
}

function useTemplate(templateItem) {
  closeTemplateDetail();
  openNewDraftModal({
    title: `${templateItem.title.replace("模板", "")} - 我的版本`,
    genre: templateItem.category,
    desc: templateItem.synopsis || templateItem.desc,
    templateId: templateItem.id,
    templateTitle: templateItem.title,
    chapters: templateItem.structure.outline.map((chapter) => ({ title: chapter.title, type: chapter.type, desc: chapter.desc })),
    characters: templateItem.sampleCharacters.map((character) => ({ ...character })),
    endings: templateItem.sampleEndings.map((ending) => ({ ...ending })),
    mechanics: templateItem.mechanics.map((mechanic) => ({ ...mechanic }))
  });
}

function showToast(message) {
  toast.message = message;
  toast.visible = true;
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    toast.visible = false;
    toast.message = "";
  }, 2600);
}

function openTool(toolId) {
  toolPanel.toolId = toolId;
  toolPanel.open = true;

  if (toolId === "character-editor") resetCharacterEditor();
  if (toolId === "dialogue-writer") resetDialogueWriter();
  if (toolId === "script-tester") resetTester();
}

function closeToolPanel() {
  toolPanel.open = false;
}

function buildEditorCharacters() {
  const pack = selectedPack.value;
  const playerCharacter = {
    characterId: "player",
    name: "主角（玩家）",
    role: pack.playerRole || "探索者",
    affinity: 50,
    trust: 50,
    alertness: 30,
    mood: "未知",
    relationshipStage: "试探期",
    revealed: true
  };

  const otherCharacters = Object.values(pack.initialCharacters || {}).map((character) => ({
    characterId: character.characterId,
    name: character.name,
    role: character.role || "角色",
    affinity: Number(character.affinity ?? 50),
    trust: Number(character.trust ?? 50),
    alertness: Number(character.alertness ?? 50),
    mood: character.mood || "中性",
    relationshipStage: character.relationshipStage || "信任建立",
    revealed: character.revealed !== false
  }));

  return [playerCharacter, ...otherCharacters];
}

function resetCharacterEditor() {
  editorCharacters.value = buildEditorCharacters();
  activeCharacterIndex.value = 0;
}

function otherCharacters(index) {
  return editorCharacters.value.filter((_, otherIndex) => otherIndex !== index);
}

function extractText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((item) => extractText(item)).find(Boolean) || "";
  }
  if (typeof value === "object") {
    if (typeof value.text === "string") return value.text;
    return Object.values(value).map((item) => extractText(item)).find(Boolean) || "";
  }
  return String(value);
}

function findCharacterById(characterId) {
  const characters = Object.values(selectedPack.value.initialCharacters || {});
  return characters.find((character) => character.characterId === characterId) || selectedPack.value.initialCharacters?.[characterId] || null;
}

function nextDialogueId() {
  dialogueLineCounter += 1;
  return `dialogue-${dialogueLineCounter}`;
}

function buildDialogueScenes() {
  const pack = selectedPack.value;
  const scenes = branchStages.value.slice(0, 3).map(({ stageId, stage }) => {
    const lines = [];

    if (Array.isArray(stage.dialogueLines)) {
      for (const line of stage.dialogueLines) {
        const text = extractText(line?.text || line);
        if (!text) continue;
        const speakerId = line?.speakerId || line?.speaker || (line?.type === "dialogue" ? pack.primaryCharacterId || "npc" : "narrator");
        const character = speakerId === "narrator" ? null : findCharacterById(speakerId);
        lines.push({
          id: nextDialogueId(),
          speakerId,
          speakerName: speakerId === "narrator" ? "旁白" : character?.name || line?.speakerName || "角色",
          text: text.slice(0, 120),
          mood: line?.mood || "",
          isNarrator: speakerId === "narrator"
        });
        if (lines.length >= 4) break;
      }
    }

    if (!lines.length) {
      const narrative = extractText(stage.storyText);
      if (narrative) {
        lines.push({
          id: nextDialogueId(),
          speakerId: "narrator",
          speakerName: "旁白",
          text: narrative.slice(0, 120),
          mood: "",
          isNarrator: true
        });
      }

      const npcText = extractText(stage.npcDialogue);
      if (npcText) {
        const npc = findCharacterById(stage.npcSpeakerId || pack.primaryCharacterId);
        lines.push({
          id: nextDialogueId(),
          speakerId: npc?.characterId || "npc",
          speakerName: npc?.name || "角色",
          text: npcText.slice(0, 120),
          mood: "",
          isNarrator: false
        });
      }
    }

    return {
      id: stageId,
      stageTitle: stage.title || stageId,
      lines
    };
  }).filter((scene) => scene.lines.length);

  if (!scenes.length) {
    return [{
      id: "scene-1",
      stageTitle: "第一幕",
      lines: [{
        id: nextDialogueId(),
        speakerId: "narrator",
        speakerName: "旁白",
        text: selectedPack.value.synopsis || "还没有对白内容。",
        mood: "",
        isNarrator: true
      }]
    }];
  }

  return scenes;
}

function resetDialogueWriter() {
  dialogueScenes.value = buildDialogueScenes();
  dialogueForm.speaker = "narrator";
  dialogueForm.mood = "";
  dialogueForm.text = "";
}

function appendTone(tone) {
  dialogueForm.text += dialogueForm.text ? `（${tone}）` : `（${tone}）`;
}

function insertDialogueLine() {
  const text = dialogueForm.text.trim();
  if (!text) return;

  const speaker = dialogueSpeakers.value.find((item) => item.characterId === dialogueForm.speaker) || dialogueSpeakers.value[0];
  const line = {
    id: nextDialogueId(),
    speakerId: speaker.characterId,
    speakerName: speaker.name,
    text,
    mood: dialogueForm.mood,
    isNarrator: speaker.characterId === "narrator"
  };

  if (!dialogueScenes.value.length) {
    dialogueScenes.value.push({ id: "scene-new", stageTitle: "新增场景", lines: [] });
  }

  dialogueScenes.value[dialogueScenes.value.length - 1].lines.push(line);
  dialogueForm.text = "";
}

function updateDialogueText(sceneIndex, lineIndex, event) {
  const text = event.target.textContent?.trim() || "";
  dialogueScenes.value[sceneIndex].lines[lineIndex].text = text;
}

function removeDialogueLine(sceneIndex, lineIndex) {
  dialogueScenes.value[sceneIndex].lines.splice(lineIndex, 1);
}

function moveDialogueLine(sceneIndex, lineIndex, direction) {
  const scene = dialogueScenes.value[sceneIndex];
  const nextIndex = lineIndex + direction;
  if (nextIndex < 0 || nextIndex >= scene.lines.length) return;
  const [line] = scene.lines.splice(lineIndex, 1);
  scene.lines.splice(nextIndex, 0, line);
}

function normalizeEndingConditions(conditions) {
  if (!Array.isArray(conditions) || !conditions.length) {
    return [{ key: "fallback", label: "变量组合", value: "依据剧情变量自动判定" }];
  }

  return conditions.map((condition, index) => {
    if (typeof condition === "string") {
      return { key: `condition-${index}`, label: condition, value: "" };
    }

    return {
      key: `condition-${index}`,
      label: condition.label || condition.name || condition.stat || `条件 ${index + 1}`,
      value: condition.value || condition.threshold || condition.detail || "已配置"
    };
  });
}

function isSuggestedClue(endingId, clueIndex) {
  return (endingOrder.indexOf(endingId) + clueIndex) % 2 === 0;
}

function flattenChoiceEffects(effects) {
  if (!effects || typeof effects !== "object") return [];

  const tags = [];
  for (const [characterId, values] of Object.entries(effects)) {
    if (!values || typeof values !== "object") continue;
    for (const [attribute, delta] of Object.entries(values)) {
      const numeric = Number(delta);
      tags.push({
        key: `${characterId}-${attribute}`,
        label: `${characterId}.${attribute} ${numeric > 0 ? '+' : ''}${numeric}`,
        positive: numeric >= 0
      });
    }
  }

  return tags;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resetTester() {
  tester.chars = {};
  tester.flags = [];
  tester.clues = [];
  tester.logs = [{ type: "system", label: "测试模式已就绪 — 选择下方节点开始模拟" }];

  for (const character of Object.values(selectedPack.value.initialCharacters || {})) {
    tester.chars[character.characterId] = {
      name: character.name,
      affinity: Number(character.affinity ?? 50),
      trust: Number(character.trust ?? 50),
      alertness: Number(character.alertness ?? 50)
    };
  }
}

function applyTestChoice(entry, choice) {
  if (choice.effects) {
    for (const [characterId, values] of Object.entries(choice.effects)) {
      if (!tester.chars[characterId]) continue;
      for (const [attribute, delta] of Object.entries(values)) {
        const nextValue = Number(tester.chars[characterId][attribute] || 0) + Number(delta || 0);
        tester.chars[characterId][attribute] = clamp(nextValue, 0, 100);
      }
    }
  }

  if (Array.isArray(choice.flagsOn)) {
    tester.flags = Array.from(new Set([...tester.flags, ...choice.flagsOn]));
  }

  if (Array.isArray(choice.unlockClues)) {
    tester.clues = Array.from(new Set([...tester.clues, ...choice.unlockClues]));
  }

  const effectSummary = flattenChoiceEffects(choice.effects)
    .map((item) => item.label)
    .join(", ");

  tester.logs.push({
    type: "choice",
    stageId: entry.stageId,
    label: `阶段：${entry.stage.title || entry.stageId} → 选择：${choice.label}`,
    summary: choice.summary || "已应用变量变化与分支结果。",
    effects: effectSummary,
    ending: Boolean(choice.ending),
    nextStageId: choice.nextStageId || ""
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
</script>
