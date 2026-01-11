// module-vocabulary-builder-enhanced.js
// Enhanced Vocabulary Builder System - DAAD Adventure Creator
// Complete implementation with all features
(function() {
    'use strict';

    console.log('Enhanced Vocabulary Builder System loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found!');
        return;
    }

    const VocabularyBuilderSystem = {
        name: 'Vocabulary Builder System',
        description: 'Complete vocabulary management with synonyms, abbreviations, and advanced features',
        category: 'Parser & Communication',
        complexity: 'Intermediate',

        init: function() {
            console.log('Enhanced Vocabulary Builder System initialized');

            if (!AdventureCreator.state.vocabulary) {
                AdventureCreator.state.vocabulary = {
                    words: [],
                    nextId: 1,
                    categories: ['VERB', 'NOUN', 'ADJECTIVE', 'PREPOSITION', 'ADVERB'],
                    synonymGroups: [],
                    abbreviations: {},
                    statistics: {
                        totalWords: 0,
                        verbCount: 0,
                        nounCount: 0,
                        adjectiveCount: 0,
                        prepositionCount: 0,
                        adverbCount: 0
                    },
                    sortBy: 'id',
                    sortOrder: 'asc',
                    searchFilter: '',
                    categoryFilter: 'ALL'
                };
            }
        },

        render: function() {
            const stats = this.getVocabularyStatistics();
            const filteredWords = this.getFilteredWords();

            return `
                <div style="padding: 2rem; background: #0a0a0a;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h2 style="color: #8b5cf6; margin: 0;">📚 Vocabulary Builder System</h2>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['vocabulary-builder'].showBulkImport()">
                                📥 Bulk Import
                            </button>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['vocabulary-builder'].exportVocabulary()">
                                💾 Export DAAD
                            </button>
                        </div>
                    </div>

                    <!-- Statistics Dashboard -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        ${this.renderStatCard('Total Words', stats.totalWords, '#8b5cf6')}
                        ${this.renderStatCard('Verbs', stats.verbCount, '#10b981')}
                        ${this.renderStatCard('Nouns', stats.nounCount, '#ec4899')}
                        ${this.renderStatCard('Adjectives', stats.adjectiveCount, '#f59e0b')}
                        ${this.renderStatCard('Prepositions', stats.prepositionCount, '#06b6d4')}
                        ${this.renderStatCard('Adverbs', stats.adverbCount, '#a855f7')}
                        ${this.renderStatCard('Synonyms', stats.synonymCount, '#ef4444')}
                        ${this.renderStatCard('Abbreviations', stats.abbreviationCount, '#3b82f6')}
                    </div>

                    <!-- Search and Filter Controls -->
                    <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 1rem; align-items: center;">
                            <div>
                                <input type="text"
                                       id="vocab-search"
                                       placeholder="🔍 Search words..."
                                       value="${AdventureCreator.state.vocabulary.searchFilter}"
                                       oninput="AdventureCreator.modules['vocabulary-builder'].updateSearch(this.value)"
                                       style="width: 100%; background: #0a0a0a; border: 1px solid #333; color: #fff; padding: 0.5rem; border-radius: 4px;">
                            </div>
                            <div>
                                <select id="vocab-category-filter"
                                        onchange="AdventureCreator.modules['vocabulary-builder'].updateCategoryFilter(this.value)"
                                        style="width: 100%; background: #0a0a0a; border: 1px solid #333; color: #fff; padding: 0.5rem; border-radius: 4px;">
                                    <option value="ALL" ${AdventureCreator.state.vocabulary.categoryFilter === 'ALL' ? 'selected' : ''}>All Categories</option>
                                    ${AdventureCreator.state.vocabulary.categories.map(cat =>
                                        `<option value="${cat}" ${AdventureCreator.state.vocabulary.categoryFilter === cat ? 'selected' : ''}>${cat}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div>
                                <select id="vocab-sort-by"
                                        onchange="AdventureCreator.modules['vocabulary-builder'].updateSort(this.value)"
                                        style="width: 100%; background: #0a0a0a; border: 1px solid #333; color: #fff; padding: 0.5rem; border-radius: 4px;">
                                    <option value="id" ${AdventureCreator.state.vocabulary.sortBy === 'id' ? 'selected' : ''}>Sort by ID</option>
                                    <option value="text" ${AdventureCreator.state.vocabulary.sortBy === 'text' ? 'selected' : ''}>Sort by Text</option>
                                    <option value="category" ${AdventureCreator.state.vocabulary.sortBy === 'category' ? 'selected' : ''}>Sort by Category</option>
                                    <option value="created" ${AdventureCreator.state.vocabulary.sortBy === 'created' ? 'selected' : ''}>Sort by Date</option>
                                </select>
                            </div>
                            <div>
                                <button onclick="AdventureCreator.modules['vocabulary-builder'].toggleSortOrder()"
                                        style="background: #333; border: 1px solid #444; color: #fff; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                                    ${AdventureCreator.state.vocabulary.sortOrder === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
                                </button>
                            </div>
                            <div>
                                <button onclick="AdventureCreator.modules['vocabulary-builder'].clearFilters()"
                                        style="background: #dc2626; border: none; color: #fff; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                                    ✖️ Clear
                                </button>
                            </div>
                        </div>
                        <div style="margin-top: 0.5rem; color: #999; font-size: 0.875rem;">
                            Showing ${filteredWords.length} of ${stats.totalWords} words
                        </div>
                    </div>

                    <!-- Vocabulary List -->
                    <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="color: #fff; margin: 0;">Vocabulary Entries</h3>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['vocabulary-builder'].showWordEditor()">
                                ➕ Add New Word
                            </button>
                        </div>
                        <div style="max-height: 400px; overflow-y: auto;">
                            ${this.renderEnhancedWordList(filteredWords)}
                        </div>
                    </div>

                    <!-- Synonym Management -->
                    <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="color: #fff; margin: 0;">🔗 Synonym Groups</h3>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['vocabulary-builder'].showSynonymEditor()">
                                ➕ Add Synonym Group
                            </button>
                        </div>
                        ${this.renderSynonymGroups()}
                    </div>

                    <!-- Abbreviation Management -->
                    <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="color: #fff; margin: 0;">📝 Abbreviations</h3>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['vocabulary-builder'].showAbbreviationEditor()">
                                ➕ Add Abbreviation
                            </button>
                        </div>
                        ${this.renderAbbreviations()}
                    </div>
                </div>

                <style>
                    .btn {
                        padding: 0.5rem 1rem;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.875rem;
                        transition: all 0.2s;
                    }
                    .btn-primary {
                        background: #8b5cf6;
                        color: white;
                    }
                    .btn-primary:hover {
                        background: #7c3aed;
                    }
                    .btn-secondary {
                        background: #333;
                        color: #fff;
                    }
                    .btn-secondary:hover {
                        background: #444;
                    }
                    .btn-danger {
                        background: #dc2626;
                        color: white;
                    }
                    .btn-danger:hover {
                        background: #b91c1c;
                    }
                    .btn-success {
                        background: #10b981;
                        color: white;
                    }
                    .btn-success:hover {
                        background: #059669;
                    }
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: 2rem;
                    }
                    .modal-content {
                        background: #1a1a1a;
                        border: 1px solid #333;
                        border-radius: 12px;
                        max-width: 600px;
                        width: 100%;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                    .modal-header {
                        padding: 1.5rem;
                        border-bottom: 1px solid #333;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .modal-body {
                        padding: 1.5rem;
                    }
                    .form-group {
                        margin-bottom: 1rem;
                    }
                    .form-label {
                        display: block;
                        color: #ccc;
                        margin-bottom: 0.5rem;
                        font-size: 0.875rem;
                        font-weight: 600;
                    }
                    .form-input {
                        width: 100%;
                        background: #0a0a0a;
                        border: 1px solid #333;
                        color: #fff;
                        padding: 0.5rem;
                        border-radius: 4px;
                        font-size: 0.875rem;
                    }
                    .form-input:focus {
                        outline: none;
                        border-color: #8b5cf6;
                    }
                </style>
            `;
        },

        renderStatCard: function(label, value, color) {
            return `
                <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 4px; padding: 1rem; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 600; color: ${color};">${value}</div>
                    <div style="font-size: 0.75rem; color: #999; text-transform: uppercase; margin-top: 0.25rem;">${label}</div>
                </div>
            `;
        },

        renderEnhancedWordList: function(words) {
            if (words.length === 0) {
                return `
                    <div style="text-align: center; color: #666; padding: 2rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📝</div>
                        <div>No vocabulary entries found. ${AdventureCreator.state.vocabulary.searchFilter ? 'Try adjusting your filters.' : 'Click "Add New Word" to get started!'}</div>
                    </div>
                `;
            }

            return words.map(word => `
                <div style="display: grid; grid-template-columns: 80px 2fr 1fr 1fr auto; gap: 1rem; align-items: center; padding: 0.75rem; background: #0a0a0a; border-radius: 4px; margin-bottom: 0.5rem;">
                    <div style="color: #666; font-family: monospace; font-size: 0.875rem;">#${word.id}</div>
                    <div>
                        <div style="font-family: monospace; color: #10b981; font-weight: 600;">${word.text.toUpperCase()}</div>
                        ${word.description ? `<div style="color: #666; font-size: 0.75rem; margin-top: 0.25rem;">${word.description}</div>` : ''}
                        ${word.synonyms && word.synonyms.length > 0 ? `<div style="color: #f59e0b; font-size: 0.75rem; margin-top: 0.25rem;">Synonyms: ${word.synonyms.join(', ')}</div>` : ''}
                    </div>
                    <div>
                        <span style="background: #333; color: #fff; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.75rem;">${word.category}</span>
                    </div>
                    <div style="color: #666; font-size: 0.75rem;">
                        ${word.created ? new Date(word.created).toLocaleDateString() : ''}
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="AdventureCreator.modules['vocabulary-builder'].editWord(${word.id})"
                                style="background: #3b82f6; border: none; color: white; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.75rem;">
                            ✏️ Edit
                        </button>
                        <button onclick="AdventureCreator.modules['vocabulary-builder'].deleteWord(${word.id})"
                                style="background: #dc2626; border: none; color: white; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.75rem;">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `).join('');
        },

        renderSynonymGroups: function() {
            const groups = AdventureCreator.state.vocabulary.synonymGroups;

            if (groups.length === 0) {
                return `
                    <div style="text-align: center; color: #666; padding: 2rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">🔗</div>
                        <div>No synonym groups defined. Click "Add Synonym Group" to create one!</div>
                    </div>
                `;
            }

            return `
                <div style="display: grid; gap: 0.5rem;">
                    ${groups.map((group, index) => `
                        <div style="background: #0a0a0a; border-left: 3px solid #f59e0b; padding: 1rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="color: #f59e0b; font-weight: 600; margin-bottom: 0.5rem;">Group ${index + 1}</div>
                                <div style="color: #ccc; font-family: monospace;">${group.words.join(', ')}</div>
                            </div>
                            <button onclick="AdventureCreator.modules['vocabulary-builder'].deleteSynonymGroup(${index})"
                                    class="btn btn-danger" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">
                                🗑️ Delete
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        renderAbbreviations: function() {
            const abbrevs = AdventureCreator.state.vocabulary.abbreviations;
            const entries = Object.entries(abbrevs);

            if (entries.length === 0) {
                return `
                    <div style="text-align: center; color: #666; padding: 2rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📝</div>
                        <div>No abbreviations defined. Click "Add Abbreviation" to create one!</div>
                    </div>
                `;
            }

            return `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.5rem;">
                    ${entries.map(([abbrev, fullWord]) => `
                        <div style="background: #0a0a0a; border-left: 3px solid #3b82f6; padding: 0.75rem; border-radius: 4px;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div style="flex: 1;">
                                    <div style="color: #3b82f6; font-weight: 600; font-family: monospace;">${abbrev.toUpperCase()}</div>
                                    <div style="color: #999; font-size: 0.75rem; margin-top: 0.25rem;">→ ${fullWord}</div>
                                </div>
                                <button onclick="AdventureCreator.modules['vocabulary-builder'].deleteAbbreviation('${abbrev}')"
                                        style="background: none; border: none; color: #dc2626; cursor: pointer; font-size: 1rem; padding: 0;">
                                    ✖️
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        // Filtering and Sorting
        getFilteredWords: function() {
            let words = [...AdventureCreator.state.vocabulary.words];

            // Apply search filter
            if (AdventureCreator.state.vocabulary.searchFilter) {
                const search = AdventureCreator.state.vocabulary.searchFilter.toLowerCase();
                words = words.filter(w =>
                    w.text.includes(search) ||
                    (w.description && w.description.toLowerCase().includes(search))
                );
            }

            // Apply category filter
            if (AdventureCreator.state.vocabulary.categoryFilter !== 'ALL') {
                words = words.filter(w => w.category === AdventureCreator.state.vocabulary.categoryFilter);
            }

            // Apply sorting
            const sortBy = AdventureCreator.state.vocabulary.sortBy;
            const order = AdventureCreator.state.vocabulary.sortOrder === 'asc' ? 1 : -1;

            words.sort((a, b) => {
                let aVal = a[sortBy];
                let bVal = b[sortBy];

                if (sortBy === 'text' || sortBy === 'category') {
                    aVal = (aVal || '').toLowerCase();
                    bVal = (bVal || '').toLowerCase();
                }

                if (aVal < bVal) return -1 * order;
                if (aVal > bVal) return 1 * order;
                return 0;
            });

            return words;
        },

        updateSearch: function(value) {
            AdventureCreator.state.vocabulary.searchFilter = value;
            AdventureCreator.navigate('editor');
        },

        updateCategoryFilter: function(value) {
            AdventureCreator.state.vocabulary.categoryFilter = value;
            AdventureCreator.navigate('editor');
        },

        updateSort: function(value) {
            AdventureCreator.state.vocabulary.sortBy = value;
            AdventureCreator.navigate('editor');
        },

        toggleSortOrder: function() {
            AdventureCreator.state.vocabulary.sortOrder =
                AdventureCreator.state.vocabulary.sortOrder === 'asc' ? 'desc' : 'asc';
            AdventureCreator.navigate('editor');
        },

        clearFilters: function() {
            AdventureCreator.state.vocabulary.searchFilter = '';
            AdventureCreator.state.vocabulary.categoryFilter = 'ALL';
            AdventureCreator.state.vocabulary.sortBy = 'id';
            AdventureCreator.state.vocabulary.sortOrder = 'asc';
            AdventureCreator.navigate('editor');
        },

        // Word Management
        showWordEditor: function(wordId = null) {
            const word = wordId ? AdventureCreator.state.vocabulary.words.find(w => w.id === wordId) : null;
            const isEdit = !!word;

            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 style="color: #fff; margin: 0;">${isEdit ? '✏️ Edit Word' : '➕ Add New Word'}</h3>
                        <button onclick="this.closest('.modal-overlay').remove()"
                                style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Word Text *</label>
                            <input type="text" id="word-text" class="form-input"
                                   value="${word ? word.text : ''}"
                                   placeholder="Enter word (e.g., examine, key, north)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Category *</label>
                            <select id="word-category" class="form-input">
                                ${AdventureCreator.state.vocabulary.categories.map(cat =>
                                    `<option value="${cat}" ${word && word.category === cat ? 'selected' : ''}>${cat}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description (optional)</label>
                            <textarea id="word-description" class="form-input" rows="3"
                                      placeholder="Optional description or notes">${word ? (word.description || '') : ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Synonyms (comma-separated, optional)</label>
                            <input type="text" id="word-synonyms" class="form-input"
                                   value="${word && word.synonyms ? word.synonyms.join(', ') : ''}"
                                   placeholder="e.g., look, inspect, search">
                        </div>
                        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['vocabulary-builder'].saveWord(${wordId || 'null'})">
                                ${isEdit ? 'Update Word' : 'Add Word'}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        },

        saveWord: function(wordId) {
            const text = document.getElementById('word-text').value.toLowerCase().trim();
            const category = document.getElementById('word-category').value;
            const description = document.getElementById('word-description').value.trim();
            const synonyms = document.getElementById('word-synonyms').value
                .split(',')
                .map(s => s.trim().toLowerCase())
                .filter(s => s);

            if (!text) {
                alert('Word text is required!');
                return;
            }

            // Check for duplicates (excluding current word if editing)
            const existing = AdventureCreator.state.vocabulary.words.find(w =>
                w.text === text && (!wordId || w.id !== wordId)
            );
            if (existing) {
                alert(`Word "${text}" already exists with ID ${existing.id}`);
                return;
            }

            if (wordId) {
                // Edit existing word
                const word = AdventureCreator.state.vocabulary.words.find(w => w.id === wordId);
                if (word) {
                    word.text = text;
                    word.category = category;
                    word.description = description;
                    word.synonyms = synonyms;
                    console.log(`Updated word #${wordId}: ${text}`);
                }
            } else {
                // Add new word
                const newWord = {
                    id: AdventureCreator.state.vocabulary.nextId++,
                    text: text,
                    category: category,
                    description: description,
                    created: new Date().toISOString(),
                    synonyms: synonyms
                };
                AdventureCreator.state.vocabulary.words.push(newWord);
                console.log(`Added new word #${newWord.id}: ${text}`);
            }

            this.updateStatistics();
            document.querySelector('.modal-overlay').remove();
            AdventureCreator.navigate('editor');
        },

        editWord: function(wordId) {
            this.showWordEditor(wordId);
        },

        deleteWord: function(wordId) {
            const word = AdventureCreator.state.vocabulary.words.find(w => w.id === wordId);
            if (!word) return;

            if (confirm(`Delete word "${word.text}" (ID: ${word.id})?\n\nThis action cannot be undone.`)) {
                const index = AdventureCreator.state.vocabulary.words.findIndex(w => w.id === wordId);
                if (index !== -1) {
                    AdventureCreator.state.vocabulary.words.splice(index, 1);
                    console.log(`Deleted word #${wordId}: ${word.text}`);
                    this.updateStatistics();
                    AdventureCreator.navigate('editor');
                }
            }
        },

        // Synonym Management
        showSynonymEditor: function() {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

            const availableWords = AdventureCreator.state.vocabulary.words.map(w => w.text);

            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 style="color: #fff; margin: 0;">🔗 Add Synonym Group</h3>
                        <button onclick="this.closest('.modal-overlay').remove()"
                                style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="color: #ccc; margin-bottom: 1rem;">
                            Enter words that should be treated as synonyms. When a player types any word in the group,
                            it will be recognized as any of the others.
                        </p>
                        <div class="form-group">
                            <label class="form-label">Synonym Words (comma-separated) *</label>
                            <input type="text" id="synonym-words" class="form-input"
                                   placeholder="e.g., examine, look, inspect, search">
                            <div style="color: #666; font-size: 0.75rem; margin-top: 0.5rem;">
                                💡 Tip: Add variations of the same action (look/examine, get/take, etc.)
                            </div>
                        </div>
                        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['vocabulary-builder'].saveSynonymGroup()">
                                Add Group
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        },

        saveSynonymGroup: function() {
            const input = document.getElementById('synonym-words').value;
            const words = input.split(',').map(w => w.trim().toLowerCase()).filter(w => w);

            if (words.length < 2) {
                alert('A synonym group must have at least 2 words!');
                return;
            }

            AdventureCreator.state.vocabulary.synonymGroups.push({ words: words });
            console.log(`Added synonym group: ${words.join(', ')}`);

            this.updateStatistics();
            document.querySelector('.modal-overlay').remove();
            AdventureCreator.navigate('editor');
        },

        deleteSynonymGroup: function(index) {
            const group = AdventureCreator.state.vocabulary.synonymGroups[index];
            if (confirm(`Delete synonym group: ${group.words.join(', ')}?`)) {
                AdventureCreator.state.vocabulary.synonymGroups.splice(index, 1);
                this.updateStatistics();
                AdventureCreator.navigate('editor');
            }
        },

        // Abbreviation Management
        showAbbreviationEditor: function() {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 style="color: #fff; margin: 0;">📝 Add Abbreviation</h3>
                        <button onclick="this.closest('.modal-overlay').remove()"
                                style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="color: #ccc; margin-bottom: 1rem;">
                            Create shortcuts for common commands. For example, "n" for "north", "x" for "examine".
                        </p>
                        <div class="form-group">
                            <label class="form-label">Abbreviation *</label>
                            <input type="text" id="abbrev-short" class="form-input"
                                   placeholder="e.g., n, x, i">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Full Word *</label>
                            <input type="text" id="abbrev-full" class="form-input"
                                   placeholder="e.g., north, examine, inventory">
                        </div>
                        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['vocabulary-builder'].saveAbbreviation()">
                                Add Abbreviation
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        },

        saveAbbreviation: function() {
            const abbrev = document.getElementById('abbrev-short').value.toLowerCase().trim();
            const fullWord = document.getElementById('abbrev-full').value.toLowerCase().trim();

            if (!abbrev || !fullWord) {
                alert('Both abbreviation and full word are required!');
                return;
            }

            if (AdventureCreator.state.vocabulary.abbreviations[abbrev]) {
                if (!confirm(`Abbreviation "${abbrev}" already exists. Overwrite?`)) {
                    return;
                }
            }

            AdventureCreator.state.vocabulary.abbreviations[abbrev] = fullWord;
            console.log(`Added abbreviation: ${abbrev} → ${fullWord}`);

            this.updateStatistics();
            document.querySelector('.modal-overlay').remove();
            AdventureCreator.navigate('editor');
        },

        deleteAbbreviation: function(abbrev) {
            const fullWord = AdventureCreator.state.vocabulary.abbreviations[abbrev];
            if (confirm(`Delete abbreviation "${abbrev}" → "${fullWord}"?`)) {
                delete AdventureCreator.state.vocabulary.abbreviations[abbrev];
                this.updateStatistics();
                AdventureCreator.navigate('editor');
            }
        },

        // Bulk Import
        showBulkImport: function() {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 style="color: #fff; margin: 0;">📥 Bulk Import Vocabulary</h3>
                        <button onclick="this.closest('.modal-overlay').remove()"
                                style="background: none; border: none; color: #999; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="color: #ccc; margin-bottom: 1rem;">
                            Import multiple words at once. Format: WORD ID or WORD (one per line).
                        </p>
                        <div class="form-group">
                            <label class="form-label">DAAD Vocabulary Text</label>
                            <textarea id="bulk-import-text" class="form-input" rows="10"
                                      placeholder="EXAMINE 1&#10;TAKE 2&#10;GO 3&#10;KEY 4&#10;DOOR 5"></textarea>
                        </div>
                        <div style="background: #0a0a0a; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
                            <div style="color: #10b981; font-weight: 600; margin-bottom: 0.5rem;">Supported Formats:</div>
                            <ul style="color: #999; font-size: 0.875rem; margin: 0; padding-left: 1.5rem;">
                                <li>WORD ID (e.g., "EXAMINE 1")</li>
                                <li>WORD only (auto-assign ID)</li>
                                <li>Lines starting with / or ; are ignored</li>
                            </ul>
                        </div>
                        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['vocabulary-builder'].processBulkImport()">
                                Import Words
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        },

        processBulkImport: function() {
            const text = document.getElementById('bulk-import-text').value;
            const lines = text.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed && !trimmed.startsWith('/') && !trimmed.startsWith(';');
            });

            let imported = 0;
            let skipped = 0;
            const errors = [];

            lines.forEach((line, index) => {
                const parts = line.trim().split(/\s+/);
                if (parts.length === 0) return;

                const text = parts[0].toLowerCase();
                let id = null;

                if (parts.length >= 2) {
                    const parsedId = parseInt(parts[1]);
                    if (!isNaN(parsedId)) {
                        id = parsedId;
                    }
                }

                // Check for duplicate
                const existing = AdventureCreator.state.vocabulary.words.find(w => w.text === text);
                if (existing) {
                    skipped++;
                    errors.push(`Line ${index + 1}: "${text}" already exists (ID: ${existing.id})`);
                    return;
                }

                // Add word
                const newWord = {
                    id: id || AdventureCreator.state.vocabulary.nextId++,
                    text: text,
                    category: 'VERB', // Default category
                    description: 'Imported word',
                    created: new Date().toISOString(),
                    synonyms: []
                };

                AdventureCreator.state.vocabulary.words.push(newWord);
                imported++;

                // Update next ID if we used a custom ID
                if (id && id >= AdventureCreator.state.vocabulary.nextId) {
                    AdventureCreator.state.vocabulary.nextId = id + 1;
                }
            });

            this.updateStatistics();

            let message = `Import complete!\n\nImported: ${imported} words\nSkipped: ${skipped} duplicates`;
            if (errors.length > 0 && errors.length <= 10) {
                message += '\n\nSkipped words:\n' + errors.join('\n');
            }

            alert(message);
            console.log(`Bulk import: ${imported} imported, ${skipped} skipped`);

            document.querySelector('.modal-overlay').remove();
            AdventureCreator.navigate('editor');
        },

        // Statistics
        getVocabularyStatistics: function() {
            const words = AdventureCreator.state.vocabulary.words;

            return {
                totalWords: words.length,
                verbCount: words.filter(w => w.category === 'VERB').length,
                nounCount: words.filter(w => w.category === 'NOUN').length,
                adjectiveCount: words.filter(w => w.category === 'ADJECTIVE').length,
                prepositionCount: words.filter(w => w.category === 'PREPOSITION').length,
                adverbCount: words.filter(w => w.category === 'ADVERB').length,
                synonymCount: AdventureCreator.state.vocabulary.synonymGroups.length,
                abbreviationCount: Object.keys(AdventureCreator.state.vocabulary.abbreviations).length
            };
        },

        updateStatistics: function() {
            const stats = this.getVocabularyStatistics();
            AdventureCreator.state.vocabulary.statistics = stats;
        },

        // Export
        exportVocabulary: function() {
            const words = AdventureCreator.state.vocabulary.words;

            if (words.length === 0) {
                alert('No vocabulary to export. Add some words first!');
                return;
            }

            let vocSection = '/VOC\n';

            const sortedWords = [...words].sort((a, b) => a.id - b.id);

            sortedWords.forEach(word => {
                vocSection += `${word.text.toUpperCase()} ${word.id}\n`;
            });

            // Add synonym groups
            if (AdventureCreator.state.vocabulary.synonymGroups.length > 0) {
                vocSection += '\n; Synonym Groups\n';
                AdventureCreator.state.vocabulary.synonymGroups.forEach(group => {
                    vocSection += `; ${group.words.join(', ')}\n`;
                });
            }

            // Add abbreviations
            const abbrevs = Object.entries(AdventureCreator.state.vocabulary.abbreviations);
            if (abbrevs.length > 0) {
                vocSection += '\n; Abbreviations\n';
                abbrevs.forEach(([abbrev, full]) => {
                    vocSection += `; ${abbrev} → ${full}\n`;
                });
            }

            console.log('Generated DAAD vocabulary:', vocSection);

            const blob = new Blob([vocSection], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'vocabulary.daad';
            a.click();
            URL.revokeObjectURL(url);

            alert(`Exported ${words.length} words, ${AdventureCreator.state.vocabulary.synonymGroups.length} synonym groups, and ${abbrevs.length} abbreviations to vocabulary.daad`);
        }
    };

    AdventureCreator.registerModule('vocabulary-builder', VocabularyBuilderSystem);

    console.log('Enhanced Vocabulary Builder System registered successfully');

})();
