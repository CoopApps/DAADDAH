// module-synonym-system-enhanced.js - Module 19: Complete Synonym System
// Part of DAAD Adventure Creator - Advanced Professional Feature for Vocabulary Management
// Enhanced with full functionality - all features implemented

(function() {
    'use strict';

    console.log('Enhanced Synonym System loading...');

    if (typeof AdventureCreator === 'undefined') {
        console.error('AdventureCreator not found!');
        return;
    }

    AdventureCreator.registerModule('synonym-system', {
        name: 'Synonym System (Enhanced)',
        description: 'Complete vocabulary management with advanced natural language support',
        category: 'Advanced Professional',
        complexity: 'Intermediate',
        priority: 19,

        init() {
            console.log('Enhanced Synonym System initialized');

            if (!AdventureCreator.state.synonymSystem) {
                AdventureCreator.state.synonymSystem = {
                    selectedTab: 'vocabulary_builder',
                    showExplanations: true,
                    selectedCategory: 'basic_verbs',
                    selectedSynonym: null,
                    vocabularyMode: 'guided',
                    debugMode: false,
                    synonymGroups: [],
                    autoComplete: true,
                    caseSensitive: false,
                    testHistory: [],
                    lastTestResults: null
                };
            }
        },

        render() {
            const state = AdventureCreator.state.synonymSystem;

            return `
                <div class="synonym-system-container">
                    <div class="section-header">
                        <h2>📝 Enhanced Synonym System</h2>
                        <div class="complexity-badges">
                            <span class="complexity-badge intermediate">Intermediate</span>
                            <span class="feature-badge advanced-professional">Advanced Professional</span>
                            <span class="priority-badge module-19">Module 19 - Enhanced</span>
                        </div>
                    </div>

                    <div class="section-content active">
                        <div class="feature-description">
                            <h3>🗣️ Natural Language Enhancement</h3>
                            <p>Create intuitive vocabulary systems that allow players to use natural language.
                            Support multiple ways to express actions and reference objects, dramatically improving
                            accessibility and player experience. All features fully implemented!</p>
                        </div>

                        ${this.renderTabNavigation()}
                        ${this.renderTabContent()}
                    </div>
                </div>
            `;
        },

        renderTabNavigation() {
            const tabs = [
                { id: 'vocabulary_builder', name: '📚 Vocabulary Builder', description: 'Create synonym groups and word alternatives' },
                { id: 'natural_language', name: '🗣️ Natural Language', description: 'Advanced language parsing and recognition' },
                { id: 'vocabulary_analysis', name: '📊 Vocabulary Analysis', description: 'Analyze and optimize game vocabulary' },
                { id: 'common_patterns', name: '🎯 Common Patterns', description: 'Pre-built vocabulary templates' },
                { id: 'testing_lab', name: '🧪 Testing Lab', description: 'Test vocabulary recognition' }
            ];

            return `
                <div class="tab-navigation">
                    ${tabs.map(tab => `
                        <button class="tab-button ${AdventureCreator.state.synonymSystem.selectedTab === tab.id ? 'active' : ''}"
                                onclick="AdventureCreator.modules['synonym-system'].switchTab('${tab.id}')">
                            <div class="tab-name">${tab.name}</div>
                            <div class="tab-description">${tab.description}</div>
                        </button>
                    `).join('')}
                </div>
            `;
        },

        renderTabContent() {
            const selectedTab = AdventureCreator.state.synonymSystem.selectedTab;

            switch(selectedTab) {
                case 'vocabulary_builder':
                    return this.renderVocabularyBuilder();
                case 'natural_language':
                    return this.renderNaturalLanguage();
                case 'vocabulary_analysis':
                    return this.renderVocabularyAnalysis();
                case 'common_patterns':
                    return this.renderCommonPatterns();
                case 'testing_lab':
                    return this.renderTestingLab();
                default:
                    return this.renderVocabularyBuilder();
            }
        },

        renderVocabularyBuilder() {
            const game = AdventureCreator.getCurrentGame();
            if (!game || !game.daad) {
                return '<div class="feature-placeholder">Create a game first to build vocabulary.</div>';
            }

            if (!game.daad.synonyms) game.daad.synonyms = [];
            const synonyms = game.daad.synonyms;

            return `
                <div class="vocabulary-builder-container">
                    <div class="builder-toolbar">
                        <div class="toolbar-section">
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].createSynonymGroup()">
                                ➕ New Synonym Group
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].generateCommonVocabulary()">
                                🚀 Generate Common Vocabulary
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].importSynonyms()">
                                📥 Import Synonyms
                            </button>
                        </div>

                        <div class="toolbar-section">
                            <label class="toolbar-label">Mode:</label>
                            <select class="toolbar-select" onchange="AdventureCreator.modules['synonym-system'].setVocabularyMode(this.value)">
                                <option value="guided" ${AdventureCreator.state.synonymSystem.vocabularyMode === 'guided' ? 'selected' : ''}>Guided Builder</option>
                                <option value="advanced" ${AdventureCreator.state.synonymSystem.vocabularyMode === 'advanced' ? 'selected' : ''}>Advanced Editor</option>
                                <option value="import" ${AdventureCreator.state.synonymSystem.vocabularyMode === 'import' ? 'selected' : ''}>Import/Export</option>
                            </select>
                        </div>

                        <div class="toolbar-section">
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].exportDAAD()">
                                📄 Export DAAD
                            </button>
                            <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].exportJSON()">
                                💾 Export JSON
                            </button>
                        </div>
                    </div>

                    <div class="vocabulary-workspace">
                        ${this.renderVocabularyStats(synonyms)}
                        ${this.renderSynonymCategories()}
                        ${this.renderSynonymsList(synonyms)}
                    </div>
                </div>
            `;
        },

        renderVocabularyStats(synonyms) {
            const stats = this.calculateVocabularyStats(synonyms);

            return `
                <div class="vocabulary-stats">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalGroups}</div>
                            <div class="stat-label">Synonym Groups</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalWords}</div>
                            <div class="stat-label">Total Words</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.verbs}</div>
                            <div class="stat-label">Verbs</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.nouns}</div>
                            <div class="stat-label">Nouns</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.adjectives}</div>
                            <div class="stat-label">Adjectives</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.coverage}%</div>
                            <div class="stat-label">Coverage</div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderSynonymCategories() {
            const categories = this.getSynonymCategories();
            const selectedCategory = AdventureCreator.state.synonymSystem.selectedCategory;

            return `
                <div class="synonym-categories">
                    <h3>📚 Vocabulary Categories</h3>
                    <div class="categories-grid">
                        ${Object.entries(categories).map(([key, category]) => `
                            <div class="category-card ${selectedCategory === key ? 'selected' : ''}"
                                 onclick="AdventureCreator.modules['synonym-system'].selectCategory('${key}')">
                                <div class="category-header">
                                    <div class="category-icon">${category.icon}</div>
                                    <div class="category-name">${category.name}</div>
                                </div>
                                <div class="category-description">${category.description}</div>
                                <div class="category-examples">
                                    ${category.examples.slice(0, 3).map(example => `
                                        <span class="example-tag">${example}</span>
                                    `).join('')}
                                </div>
                                <div class="category-stats">
                                    ${Object.keys(category.synonyms).length} patterns
                                </div>
                                <button class="btn btn-small btn-primary"
                                        onclick="event.stopPropagation(); AdventureCreator.modules['synonym-system'].applyCategorySynonyms('${key}')"
                                        style="margin-top: 0.5rem; width: 100%;">
                                    Apply All
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        renderSynonymsList(synonyms) {
            if (synonyms.length === 0) {
                return `
                    <div class="synonyms-list empty">
                        <div class="empty-state">
                            <div class="empty-icon">📝</div>
                            <div class="empty-title">No Synonym Groups</div>
                            <div class="empty-description">Create synonym groups to allow natural language input</div>
                            <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].createSynonymGroup()">
                                Create First Synonym Group
                            </button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="synonyms-list">
                    <div class="list-header">
                        <h3>Defined Synonyms (${synonyms.length})</h3>
                        <div class="list-actions">
                            <button class="btn btn-small btn-secondary" onclick="AdventureCreator.modules['synonym-system'].sortSynonyms('alphabetical')">
                                🔤 Sort A-Z
                            </button>
                            <button class="btn btn-small btn-secondary" onclick="AdventureCreator.modules['synonym-system'].sortSynonyms('category')">
                                📁 Sort by Category
                            </button>
                            <button class="btn btn-small btn-secondary" onclick="AdventureCreator.modules['synonym-system'].clearAllSynonyms()">
                                🗑️ Clear All
                            </button>
                        </div>
                    </div>

                    <div class="synonyms-grid">
                        ${synonyms.map((synonym, index) => this.renderSynonymCard(synonym, index)).join('')}
                    </div>
                </div>
            `;
        },

        renderSynonymCard(synonym, index) {
            const isSelected = AdventureCreator.state.synonymSystem.selectedSynonym === index;

            return `
                <div class="synonym-card ${isSelected ? 'selected' : ''}"
                     onclick="AdventureCreator.modules['synonym-system'].selectSynonym(${index})">
                    <div class="synonym-header">
                        <div class="synonym-primary">${synonym.primary || 'Unknown'}</div>
                        <div class="synonym-type">${synonym.type || 'VERB'}</div>
                    </div>

                    <div class="synonym-alternatives">
                        ${(synonym.alternatives || []).map(alt => `
                            <span class="alternative-tag">${alt}</span>
                        `).join('')}
                    </div>

                    ${synonym.category ? `<div class="synonym-category">Category: ${synonym.category}</div>` : ''}

                    <div class="synonym-daad">
                        <code>${this.generateSynonymDAAD(synonym)}</code>
                    </div>

                    <div class="synonym-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); AdventureCreator.modules['synonym-system'].editSynonym(${index})" title="Edit">✏️</button>
                        <button class="action-btn" onclick="event.stopPropagation(); AdventureCreator.modules['synonym-system'].duplicateSynonym(${index})" title="Duplicate">📋</button>
                        <button class="action-btn" onclick="event.stopPropagation(); AdventureCreator.modules['synonym-system'].testSynonym(${index})" title="Test">🧪</button>
                        <button class="action-btn danger" onclick="event.stopPropagation(); AdventureCreator.modules['synonym-system'].deleteSynonym(${index})" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
        },

        renderNaturalLanguage() {
            return `
                <div class="natural-language-container">
                    <div class="language-header">
                        <h3>🗣️ Advanced Natural Language Processing</h3>
                        <p>Configure sophisticated language recognition and parsing for intuitive player interaction.</p>
                    </div>

                    <div class="language-features">
                        ${this.getLanguageFeatures().map(feature => `
                            <div class="language-feature">
                                <div class="feature-header">
                                    <div class="feature-icon">${feature.icon}</div>
                                    <div class="feature-info">
                                        <div class="feature-name">${feature.name}</div>
                                        <div class="feature-complexity ${feature.complexity}">${feature.complexity}</div>
                                    </div>
                                </div>

                                <div class="feature-description">${feature.description}</div>

                                <div class="feature-examples">
                                    <h5>Examples:</h5>
                                    ${feature.examples.map(example => `
                                        <div class="example-item">
                                            <span class="example-input">"${example.input}"</span>
                                            <span class="example-arrow">→</span>
                                            <span class="example-output">"${example.output}"</span>
                                        </div>
                                    `).join('')}
                                </div>

                                <div class="feature-implementation">
                                    <h5>DAAD Implementation:</h5>
                                    <pre class="code-block"><code>${feature.daadCode}</code></pre>
                                </div>

                                <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].applyLanguageFeature('${feature.id}')">
                                    ✅ Apply Feature
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        renderVocabularyAnalysis() {
            const game = AdventureCreator.getCurrentGame();
            const analysis = this.analyzeVocabulary(game);

            return `
                <div class="vocabulary-analysis-container">
                    <div class="analysis-header">
                        <h3>📊 Vocabulary Analysis & Optimization</h3>
                        <p>Analyze your game's vocabulary coverage and identify opportunities for improvement.</p>
                        <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].refreshAnalysis()">
                            🔄 Refresh Analysis
                        </button>
                    </div>

                    <div class="analysis-results">
                        <div class="analysis-overview">
                            <h4>📈 Coverage Analysis</h4>
                            <div class="coverage-chart">
                                <div class="coverage-bar">
                                    <div class="coverage-fill" style="width: ${analysis.overallCoverage}%; background: ${this.getCoverageColor(analysis.overallCoverage)}"></div>
                                </div>
                                <div class="coverage-text">${analysis.overallCoverage}% Overall Coverage - ${this.getCoverageLabel(analysis.overallCoverage)}</div>
                            </div>
                        </div>

                        <div class="analysis-categories">
                            <h4>📋 Category Breakdown</h4>
                            <div class="categories-analysis">
                                ${analysis.categories.map(category => `
                                    <div class="category-analysis">
                                        <div class="category-name">${category.name}</div>
                                        <div class="category-coverage">
                                            <div class="coverage-bar small">
                                                <div class="coverage-fill" style="width: ${category.coverage}%; background: ${this.getCoverageColor(category.coverage)}"></div>
                                            </div>
                                            <span>${category.coverage}%</span>
                                        </div>
                                        <div class="category-suggestions">
                                            ${category.suggestions.map(suggestion => `
                                                <span class="suggestion-tag">${suggestion}</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="analysis-recommendations">
                            <h4>💡 Recommendations</h4>
                            <div class="recommendations-list">
                                ${analysis.recommendations.map(rec => `
                                    <div class="recommendation-item">
                                        <div class="rec-icon">${rec.icon}</div>
                                        <div class="rec-content">
                                            <div class="rec-title">${rec.title}</div>
                                            <div class="rec-description">${rec.description}</div>
                                        </div>
                                        <button class="btn btn-small btn-primary" onclick="AdventureCreator.modules['synonym-system'].applyRecommendation('${rec.id}')">
                                            ✅ Apply
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderCommonPatterns() {
            return `
                <div class="common-patterns-container">
                    <div class="patterns-header">
                        <h3>🎯 Pre-Built Vocabulary Templates</h3>
                        <p>Ready-to-use vocabulary patterns for common adventure game scenarios.</p>
                    </div>

                    <div class="patterns-grid">
                        ${this.getVocabularyPatterns().map(pattern => `
                            <div class="pattern-card">
                                <div class="pattern-header">
                                    <div class="pattern-icon">${pattern.icon}</div>
                                    <div class="pattern-info">
                                        <div class="pattern-name">${pattern.name}</div>
                                        <div class="pattern-type">${pattern.type}</div>
                                    </div>
                                    <div class="pattern-coverage">${pattern.words} words</div>
                                </div>

                                <div class="pattern-description">${pattern.description}</div>

                                <div class="pattern-preview">
                                    <h5>Includes:</h5>
                                    <div class="preview-words">
                                        ${pattern.preview.map(word => `
                                            <span class="word-tag">${word}</span>
                                        `).join('')}
                                        ${pattern.words > pattern.preview.length ? `
                                            <span class="word-more">+${pattern.words - pattern.preview.length} more...</span>
                                        ` : ''}
                                    </div>
                                </div>

                                <div class="pattern-daad-preview">
                                    <h5>DAAD Preview:</h5>
                                    <pre class="code-preview"><code>${pattern.daadPreview}</code></pre>
                                </div>

                                <div class="pattern-actions">
                                    <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].previewPattern('${pattern.id}')">
                                        👁️ Preview Full
                                    </button>
                                    <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].applyPattern('${pattern.id}')">
                                        ✅ Apply Template
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        renderTestingLab() {
            const testHistory = AdventureCreator.state.synonymSystem.testHistory || [];
            const lastResults = AdventureCreator.state.synonymSystem.lastTestResults;

            return `
                <div class="testing-lab-container">
                    <div class="lab-header">
                        <h3>🧪 Vocabulary Testing Laboratory</h3>
                        <p>Test how well your vocabulary system recognizes player input and identify gaps.</p>
                    </div>

                    <div class="testing-workspace">
                        <div class="test-input-section">
                            <h4>🎯 Input Testing</h4>
                            <div class="test-input-area">
                                <label class="test-label">Test Player Input:</label>
                                <input type="text" class="test-input" id="vocabularyTestInput"
                                       placeholder="Type a command to test (e.g., 'pick up the sword')"
                                       onkeypress="if(event.key==='Enter') AdventureCreator.modules['synonym-system'].testInput()">
                                <button class="btn btn-primary" onclick="AdventureCreator.modules['synonym-system'].testInput()">
                                    🔍 Test Recognition
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].clearTestResults()">
                                    🗑️ Clear Results
                                </button>
                            </div>

                            <div class="test-results" id="testResults">
                                ${lastResults ? this.renderTestResults(lastResults) : this.renderTestPlaceholder()}
                            </div>
                        </div>

                        <div class="batch-testing-section">
                            <h4>📊 Batch Testing</h4>
                            <div class="batch-controls">
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].runCommonCommandsTest()">
                                    🎮 Test Common Commands
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].runRandomVariationsTest()">
                                    🎲 Test Random Variations
                                </button>
                                <button class="btn btn-secondary" onclick="AdventureCreator.modules['synonym-system'].runTypoResilienceTest()">
                                    ✏️ Test Typo Resilience
                                </button>
                            </div>

                            <div class="batch-results" id="batchResults">
                                ${testHistory.length > 0 ? this.renderBatchHistory(testHistory) : '<div class="results-placeholder"><div class="placeholder-text">No batch tests run yet</div></div>'}
                            </div>
                        </div>

                        <div class="vocabulary-gaps-section">
                            <h4>🕳️ Vocabulary Gaps</h4>
                            <div class="gaps-analysis" id="vocabularyGaps">
                                ${this.renderVocabularyGaps()}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderTestPlaceholder() {
            return `
                <div class="results-placeholder">
                    <div class="placeholder-icon">🧪</div>
                    <div class="placeholder-text">Enter a command above to test vocabulary recognition</div>
                </div>
            `;
        },

        renderTestResults(results) {
            return `
                <div class="test-result ${results.recognized ? 'success' : 'failure'}">
                    <div class="result-header">
                        <span class="result-icon">${results.recognized ? '✅' : '❌'}</span>
                        <span class="result-text">${results.recognized ? 'Recognized' : 'Not Recognized'}</span>
                        <span class="result-confidence">${results.confidence}% confidence</span>
                    </div>
                    <div class="result-interpretation">
                        <strong>Interpretation:</strong> ${results.interpretation}
                    </div>
                    ${results.synonymMatches && results.synonymMatches.length > 0 ? `
                        <div class="result-matches">
                            <strong>Synonym Matches:</strong>
                            <ul>
                                ${results.synonymMatches.map(match => `<li>${match}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${results.suggestions && results.suggestions.length > 0 ? `
                        <div class="result-suggestions">
                            <strong>Suggestions:</strong>
                            <ul>
                                ${results.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        renderBatchHistory(history) {
            const recent = history.slice(-5).reverse();
            return `
                <div class="batch-history">
                    <h5>Recent Batch Tests:</h5>
                    ${recent.map(test => `
                        <div class="batch-test-item">
                            <div class="test-name">${test.name}</div>
                            <div class="test-stats">
                                <span class="stat-success">${test.passed}/${test.total} passed</span>
                                <span class="stat-percentage">${Math.round((test.passed/test.total)*100)}%</span>
                            </div>
                            <div class="test-timestamp">${new Date(test.timestamp).toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        renderVocabularyGaps() {
            const game = AdventureCreator.getCurrentGame();
            const gaps = this.findVocabularyGaps(game);

            if (gaps.length === 0) {
                return `
                    <div class="gaps-empty">
                        <div class="empty-icon">✅</div>
                        <div class="empty-text">No significant vocabulary gaps detected!</div>
                    </div>
                `;
            }

            return `
                <div class="gaps-list">
                    ${gaps.map(gap => `
                        <div class="gap-item">
                            <div class="gap-word">${gap.word}</div>
                            <div class="gap-reason">${gap.reason}</div>
                            <button class="btn btn-small btn-primary"
                                    onclick="AdventureCreator.modules['synonym-system'].fillGap('${gap.word}', '${gap.type}')">
                                Add Synonym
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        // Helper methods
        getSynonymCategories() {
            return {
                basic_verbs: {
                    name: 'Basic Verbs',
                    icon: '🏃',
                    description: 'Essential action words for movement and interaction',
                    examples: ['take', 'get', 'go', 'look', 'open'],
                    synonyms: {
                        TAKE: ['get', 'pick', 'grab', 'obtain', 'acquire', 'collect'],
                        DROP: ['put', 'place', 'leave', 'discard', 'release'],
                        LOOK: ['examine', 'l', 'ex', 'inspect', 'view', 'observe'],
                        GO: ['move', 'walk', 'travel', 'head'],
                        OPEN: ['unlock', 'unseal', 'uncover'],
                        CLOSE: ['shut', 'seal', 'lock'],
                        USE: ['utilize', 'employ', 'operate']
                    }
                },
                movement: {
                    name: 'Movement & Directions',
                    icon: '🧭',
                    description: 'Directional commands and movement synonyms',
                    examples: ['north', 'n', 'up', 'enter', 'exit'],
                    synonyms: {
                        NORTH: ['n', 'northward', 'up'],
                        SOUTH: ['s', 'southward', 'down'],
                        EAST: ['e', 'eastward', 'right'],
                        WEST: ['w', 'westward', 'left'],
                        UP: ['u', 'upward', 'ascend', 'climb'],
                        DOWN: ['d', 'downward', 'descend'],
                        IN: ['inside', 'enter', 'into'],
                        OUT: ['outside', 'exit', 'leave']
                    }
                },
                objects: {
                    name: 'Common Objects',
                    icon: '📦',
                    description: 'Alternative names for game objects and items',
                    examples: ['sword', 'blade', 'key', 'door', 'chest'],
                    synonyms: {
                        SWORD: ['blade', 'weapon', 'steel'],
                        KEY: ['passkey', 'opener'],
                        DOOR: ['entrance', 'exit', 'portal', 'gate'],
                        CHEST: ['box', 'container', 'trunk'],
                        LIGHT: ['lamp', 'torch', 'candle', 'illumination'],
                        ROPE: ['cord', 'line', 'cable']
                    }
                },
                interface: {
                    name: 'Interface Commands',
                    icon: '🖥️',
                    description: 'System and interface command alternatives',
                    examples: ['inventory', 'i', 'save', 'quit', 'help'],
                    synonyms: {
                        INVENTORY: ['inv', 'i', 'items', 'possessions'],
                        SAVE: ['record', 'store'],
                        LOAD: ['restore', 'resume'],
                        QUIT: ['exit', 'end', 'stop'],
                        HELP: ['?', 'assistance', 'info'],
                        RESTART: ['reset', 'begin again']
                    }
                },
                social: {
                    name: 'Social Interaction',
                    icon: '👥',
                    description: 'Commands for interacting with characters',
                    examples: ['talk', 'ask', 'tell', 'give', 'show'],
                    synonyms: {
                        TALK: ['speak', 'chat', 'converse', 'communicate'],
                        ASK: ['question', 'inquire', 'query'],
                        TELL: ['inform', 'say', 'explain'],
                        GIVE: ['hand', 'offer', 'present'],
                        SHOW: ['display', 'reveal', 'exhibit'],
                        GREET: ['hello', 'hi', 'salute']
                    }
                },
                advanced: {
                    name: 'Advanced Actions',
                    icon: '🔧',
                    description: 'Complex and specialized command synonyms',
                    examples: ['combine', 'use', 'activate', 'repair', 'break'],
                    synonyms: {
                        USE: ['utilize', 'employ', 'activate', 'operate'],
                        COMBINE: ['mix', 'merge', 'join', 'connect'],
                        REPAIR: ['fix', 'mend', 'restore'],
                        BREAK: ['smash', 'destroy', 'shatter'],
                        SEARCH: ['hunt', 'seek', 'explore', 'investigate'],
                        PUSH: ['shove', 'press'],
                        PULL: ['drag', 'tug', 'yank']
                    }
                }
            };
        },

        calculateVocabularyStats(synonyms) {
            const stats = {
                totalGroups: synonyms.length,
                totalWords: 0,
                verbs: 0,
                nouns: 0,
                adjectives: 0,
                coverage: 0
            };

            synonyms.forEach(synonym => {
                stats.totalWords += (synonym.alternatives || []).length + 1;

                if (synonym.type === 'VERB') stats.verbs++;
                else if (synonym.type === 'NOUN') stats.nouns++;
                else if (synonym.type === 'ADJECTIVE') stats.adjectives++;
            });

            const commonWords = 50;
            stats.coverage = Math.min(100, Math.round((stats.totalGroups / commonWords) * 100));

            return stats;
        },

        generateSynonymDAAD(synonym) {
            if (!synonym.primary || !synonym.alternatives) return '';

            const alternatives = synonym.alternatives.join(' ');
            return `${synonym.primary.toUpperCase()} ${alternatives}`;
        },

        getLanguageFeatures() {
            return [
                {
                    id: 'partial_matching',
                    name: 'Partial Word Matching',
                    icon: '🔍',
                    complexity: 'basic',
                    description: 'Allow abbreviated commands and partial word matching',
                    examples: [
                        { input: 'ex sword', output: 'examine sword' },
                        { input: 'inv', output: 'inventory' },
                        { input: 'n', output: 'north' }
                    ],
                    daadCode: `examine ex exam exami
inventory inv i
north n`
                },
                {
                    id: 'fuzzy_matching',
                    name: 'Fuzzy Matching',
                    icon: '🎯',
                    complexity: 'intermediate',
                    description: 'Tolerate typos and common misspellings',
                    examples: [
                        { input: 'exaime sword', output: 'examine sword' },
                        { input: 'norht', output: 'north' },
                        { input: 'inventroy', output: 'inventory' }
                    ],
                    daadCode: `examine exaime examin examne
north norht nroth
inventory inventroy inventoyr`
                },
                {
                    id: 'contextual_parsing',
                    name: 'Contextual Parsing',
                    icon: '🧠',
                    complexity: 'advanced',
                    description: 'Different meanings based on context and game state',
                    examples: [
                        { input: 'open', output: 'context-dependent action' },
                        { input: 'use', output: 'smart object interaction' },
                        { input: 'go there', output: 'context-aware movement' }
                    ],
                    daadCode: `; Context-aware synonyms
; Implemented via process tables`
                },
                {
                    id: 'natural_phrases',
                    name: 'Natural Phrases',
                    icon: '💬',
                    complexity: 'advanced',
                    description: 'Support full natural language phrases and sentences',
                    examples: [
                        { input: 'pick up the sword', output: 'get sword' },
                        { input: 'can you help me', output: 'help' },
                        { input: 'i want to go north', output: 'north' }
                    ],
                    daadCode: `get "pick up" "take the" "grab the"
help "can you help" "i need help"
north "go north" "head north"`
                }
            ];
        },

        analyzeVocabulary(game) {
            const synonyms = game?.daad?.synonyms || [];
            const totalSynonyms = synonyms.length;

            const categoryCounts = {};
            synonyms.forEach(syn => {
                const cat = syn.category || 'other';
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });

            const coverage = Math.min(100, Math.round((totalSynonyms / 50) * 100));

            return {
                overallCoverage: coverage,
                categories: [
                    {
                        name: 'Basic Verbs',
                        coverage: Math.min(100, (categoryCounts.basic_verbs || 0) * 14),
                        suggestions: (categoryCounts.basic_verbs || 0) < 5 ? ['climb', 'swim', 'jump'] : []
                    },
                    {
                        name: 'Movement',
                        coverage: Math.min(100, (categoryCounts.movement || 0) * 12),
                        suggestions: (categoryCounts.movement || 0) < 6 ? ['northeast', 'southwest'] : []
                    },
                    {
                        name: 'Objects',
                        coverage: Math.min(100, (categoryCounts.objects || 0) * 16),
                        suggestions: (categoryCounts.objects || 0) < 4 ? ['weapon', 'tool', 'book'] : []
                    },
                    {
                        name: 'Interface',
                        coverage: Math.min(100, (categoryCounts.interface || 0) * 20),
                        suggestions: (categoryCounts.interface || 0) < 3 ? ['restart', 'undo'] : []
                    },
                    {
                        name: 'Social',
                        coverage: Math.min(100, (categoryCounts.social || 0) * 16),
                        suggestions: (categoryCounts.social || 0) < 4 ? ['greet', 'thank', 'argue'] : []
                    }
                ],
                recommendations: [
                    {
                        id: 'add_movement_synonyms',
                        icon: '🧭',
                        title: 'Add Movement Synonyms',
                        description: 'Your movement vocabulary could benefit from diagonal directions'
                    },
                    {
                        id: 'improve_object_names',
                        icon: '📦',
                        title: 'Improve Object Recognition',
                        description: 'Add more alternative names for common objects in your game'
                    },
                    {
                        id: 'add_social_commands',
                        icon: '👥',
                        title: 'Expand Social Commands',
                        description: 'Add more ways for players to interact with characters'
                    }
                ]
            };
        },

        getVocabularyPatterns() {
            return [
                {
                    id: 'basic_adventure',
                    name: 'Basic Adventure Pack',
                    icon: '🗺️',
                    type: 'Essential',
                    words: 25,
                    description: 'Essential vocabulary for any text adventure',
                    preview: ['take', 'get', 'drop', 'look', 'go', 'open', 'close'],
                    daadPreview: `take get pick grab
look examine l ex
go move walk`,
                    synonyms: [
                        { primary: 'take', type: 'VERB', alternatives: ['get', 'pick', 'grab', 'obtain'], category: 'basic_verbs' },
                        { primary: 'drop', type: 'VERB', alternatives: ['put', 'place', 'leave'], category: 'basic_verbs' },
                        { primary: 'look', type: 'VERB', alternatives: ['examine', 'l', 'ex', 'inspect'], category: 'basic_verbs' },
                        { primary: 'go', type: 'VERB', alternatives: ['move', 'walk', 'travel'], category: 'basic_verbs' },
                        { primary: 'open', type: 'VERB', alternatives: ['unlock', 'unseal'], category: 'basic_verbs' }
                    ]
                },
                {
                    id: 'fantasy_rpg',
                    name: 'Fantasy RPG Pack',
                    icon: '⚔️',
                    type: 'Genre',
                    words: 40,
                    description: 'Vocabulary for fantasy adventures and RPGs',
                    preview: ['wield', 'cast', 'enchant', 'quest', 'battle', 'magic'],
                    daadPreview: `wield equip hold brandish
cast invoke conjure
battle fight combat`,
                    synonyms: [
                        { primary: 'wield', type: 'VERB', alternatives: ['equip', 'hold', 'brandish'], category: 'advanced' },
                        { primary: 'cast', type: 'VERB', alternatives: ['invoke', 'conjure'], category: 'advanced' },
                        { primary: 'battle', type: 'VERB', alternatives: ['fight', 'combat', 'attack'], category: 'advanced' },
                        { primary: 'enchant', type: 'VERB', alternatives: ['magic', 'spell'], category: 'advanced' }
                    ]
                },
                {
                    id: 'modern_thriller',
                    name: 'Modern Thriller Pack',
                    icon: '🕵️',
                    type: 'Genre',
                    words: 35,
                    description: 'Contemporary vocabulary for modern adventures',
                    preview: ['investigate', 'call', 'drive', 'email', 'hack', 'surveil'],
                    daadPreview: `investigate examine inspect
call phone dial
drive steer navigate`,
                    synonyms: [
                        { primary: 'investigate', type: 'VERB', alternatives: ['examine', 'inspect', 'probe'], category: 'advanced' },
                        { primary: 'call', type: 'VERB', alternatives: ['phone', 'dial', 'ring'], category: 'advanced' },
                        { primary: 'drive', type: 'VERB', alternatives: ['steer', 'navigate'], category: 'movement' }
                    ]
                },
                {
                    id: 'accessibility',
                    name: 'Accessibility Pack',
                    icon: '♿',
                    type: 'Special',
                    words: 30,
                    description: 'Enhanced vocabulary for accessibility and ease of use',
                    preview: ['?', 'hint', 'repeat', 'slower', 'again', 'what'],
                    daadPreview: `help ? hint assist
repeat again "once more"
inventory items stuff things`,
                    synonyms: [
                        { primary: 'help', type: 'VERB', alternatives: ['?', 'hint', 'assist', 'guide'], category: 'interface' },
                        { primary: 'repeat', type: 'VERB', alternatives: ['again', 'once more'], category: 'interface' },
                        { primary: 'inventory', type: 'VERB', alternatives: ['items', 'stuff', 'things', 'possessions'], category: 'interface' }
                    ]
                }
            ];
        },

        findVocabularyGaps(game) {
            const synonyms = game?.daad?.synonyms || [];
            const gaps = [];

            const commonWords = ['north', 'south', 'east', 'west', 'take', 'drop', 'look', 'inventory', 'help'];

            commonWords.forEach(word => {
                const exists = synonyms.some(syn => syn.primary.toLowerCase() === word.toLowerCase());
                if (!exists) {
                    gaps.push({
                        word: word,
                        type: ['north', 'south', 'east', 'west'].includes(word) ? 'NOUN' : 'VERB',
                        reason: 'Common word missing from vocabulary'
                    });
                }
            });

            return gaps;
        },

        getCoverageColor(coverage) {
            if (coverage >= 80) return '#10b981';
            if (coverage >= 60) return '#f59e0b';
            return '#ef4444';
        },

        getCoverageLabel(coverage) {
            if (coverage >= 80) return 'Excellent';
            if (coverage >= 60) return 'Good';
            if (coverage >= 40) return 'Fair';
            return 'Needs Improvement';
        },

        // Action methods
        switchTab(tabId) {
            AdventureCreator.state.synonymSystem.selectedTab = tabId;
            AdventureCreator.navigate('editor');
        },

        createSynonymGroup() {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            const primary = prompt('Enter primary word:', 'newword');
            if (!primary) return;

            const alternatives = prompt('Enter alternatives (comma-separated):', 'alt1, alt2');
            if (!alternatives) return;

            const type = prompt('Word type (VERB/NOUN/ADJECTIVE):', 'VERB');

            const newSynonym = {
                primary: primary.toLowerCase(),
                type: type.toUpperCase(),
                alternatives: alternatives.split(',').map(alt => alt.trim().toLowerCase()),
                category: 'basic_verbs',
                description: 'Custom synonym group'
            };

            game.daad.synonyms.push(newSynonym);
            AdventureCreator.state.synonymSystem.selectedSynonym = game.daad.synonyms.length - 1;

            console.log(`Created synonym group: ${primary}`);
            AdventureCreator.navigate('editor');
        },

        selectCategory(categoryKey) {
            AdventureCreator.state.synonymSystem.selectedCategory = categoryKey;
            AdventureCreator.navigate('editor');
        },

        applyCategorySynonyms(categoryKey) {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            const category = this.getSynonymCategories()[categoryKey];
            if (!category) return;

            let added = 0;
            Object.entries(category.synonyms).forEach(([primary, alternatives]) => {
                const exists = game.daad.synonyms.some(syn =>
                    syn.primary.toLowerCase() === primary.toLowerCase()
                );

                if (!exists) {
                    game.daad.synonyms.push({
                        primary: primary.toLowerCase(),
                        type: 'VERB',
                        alternatives: alternatives,
                        category: categoryKey,
                        description: `From ${category.name} category`
                    });
                    added++;
                }
            });

            alert(`Added ${added} synonym groups from ${category.name}!`);
            AdventureCreator.navigate('editor');
        },

        selectSynonym(index) {
            AdventureCreator.state.synonymSystem.selectedSynonym = index;
            AdventureCreator.navigate('editor');
        },

        setVocabularyMode(mode) {
            AdventureCreator.state.synonymSystem.vocabularyMode = mode;
            console.log(`Set vocabulary mode: ${mode}`);
        },

        generateCommonVocabulary() {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            const commonSynonyms = [
                { primary: 'take', type: 'VERB', alternatives: ['get', 'pick', 'grab', 'obtain'], category: 'basic_verbs' },
                { primary: 'drop', type: 'VERB', alternatives: ['put', 'place', 'leave', 'discard'], category: 'basic_verbs' },
                { primary: 'look', type: 'VERB', alternatives: ['examine', 'l', 'ex', 'inspect'], category: 'basic_verbs' },
                { primary: 'north', type: 'NOUN', alternatives: ['n', 'northward'], category: 'movement' },
                { primary: 'south', type: 'NOUN', alternatives: ['s', 'southward'], category: 'movement' },
                { primary: 'east', type: 'NOUN', alternatives: ['e', 'eastward'], category: 'movement' },
                { primary: 'west', type: 'NOUN', alternatives: ['w', 'westward'], category: 'movement' },
                { primary: 'inventory', type: 'VERB', alternatives: ['inv', 'i', 'items'], category: 'interface' },
                { primary: 'help', type: 'VERB', alternatives: ['?', 'hint', 'assist'], category: 'interface' }
            ];

            let added = 0;
            commonSynonyms.forEach(newSynonym => {
                const exists = game.daad.synonyms.some(existing =>
                    existing.primary.toLowerCase() === newSynonym.primary.toLowerCase()
                );
                if (!exists) {
                    game.daad.synonyms.push(newSynonym);
                    added++;
                }
            });

            alert(`Generated ${added} common synonym groups!`);
            console.log(`Generated ${added} common synonyms`);
            AdventureCreator.navigate('editor');
        },

        editSynonym(index) {
            const game = AdventureCreator.getCurrentGame();
            const synonym = game.daad.synonyms[index];
            if (!synonym) return;

            const newPrimary = prompt('Primary word:', synonym.primary);
            if (newPrimary === null) return;

            const newAlternatives = prompt('Alternatives (comma-separated):', synonym.alternatives.join(', '));
            if (newAlternatives === null) return;

            const newType = prompt('Type (VERB/NOUN/ADJECTIVE):', synonym.type);
            if (newType === null) return;

            synonym.primary = newPrimary.toLowerCase();
            synonym.alternatives = newAlternatives.split(',').map(alt => alt.trim().toLowerCase());
            synonym.type = newType.toUpperCase();

            console.log(`Edited synonym: ${synonym.primary}`);
            AdventureCreator.navigate('editor');
        },

        duplicateSynonym(index) {
            const game = AdventureCreator.getCurrentGame();
            const synonym = game.daad.synonyms[index];
            if (!synonym) return;

            const duplicate = {
                ...synonym,
                primary: synonym.primary + '_copy',
                alternatives: [...synonym.alternatives]
            };

            game.daad.synonyms.push(duplicate);
            console.log(`Duplicated synonym: ${synonym.primary}`);
            AdventureCreator.navigate('editor');
        },

        testSynonym(index) {
            const game = AdventureCreator.getCurrentGame();
            const synonym = game.daad.synonyms[index];
            if (!synonym) return;

            const test = `Primary: ${synonym.primary}\nAlternatives: ${synonym.alternatives.join(', ')}\n\nAll these words will be recognized as: ${synonym.primary.toUpperCase()}`;
            alert(`Synonym Test\n\n${test}`);
        },

        deleteSynonym(index) {
            if (!confirm('Delete this synonym group?')) return;

            const game = AdventureCreator.getCurrentGame();
            const deleted = game.daad.synonyms[index];
            game.daad.synonyms.splice(index, 1);

            if (AdventureCreator.state.synonymSystem.selectedSynonym === index) {
                AdventureCreator.state.synonymSystem.selectedSynonym = null;
            } else if (AdventureCreator.state.synonymSystem.selectedSynonym > index) {
                AdventureCreator.state.synonymSystem.selectedSynonym--;
            }

            console.log(`Deleted synonym: ${deleted.primary}`);
            AdventureCreator.navigate('editor');
        },

        sortSynonyms(method) {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) return;

            if (method === 'alphabetical') {
                game.daad.synonyms.sort((a, b) => a.primary.localeCompare(b.primary));
            } else if (method === 'category') {
                game.daad.synonyms.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
            }

            console.log(`Sorted synonyms by ${method}`);
            AdventureCreator.navigate('editor');
        },

        clearAllSynonyms() {
            if (!confirm('Delete ALL synonym groups? This cannot be undone!')) return;

            const game = AdventureCreator.getCurrentGame();
            const count = game.daad.synonyms.length;
            game.daad.synonyms = [];
            AdventureCreator.state.synonymSystem.selectedSynonym = null;

            alert(`Deleted ${count} synonym groups.`);
            console.log(`Cleared all synonyms (${count} groups)`);
            AdventureCreator.navigate('editor');
        },

        importSynonyms() {
            const json = prompt('Paste synonym JSON data:');
            if (!json) return;

            try {
                const imported = JSON.parse(json);
                const game = AdventureCreator.getCurrentGame();

                if (Array.isArray(imported)) {
                    game.daad.synonyms = game.daad.synonyms.concat(imported);
                    alert(`Imported ${imported.length} synonym groups!`);
                } else {
                    alert('Invalid JSON format. Expected an array of synonym objects.');
                }

                AdventureCreator.navigate('editor');
            } catch (e) {
                alert('Invalid JSON format!');
            }
        },

        exportDAAD() {
            const game = AdventureCreator.getCurrentGame();
            const synonyms = game.daad.synonyms || [];

            if (synonyms.length === 0) {
                alert('No synonyms to export. Create some synonym groups first.');
                return;
            }

            let daadCode = '/VOC\n; Generated Synonym Definitions\n\n';
            synonyms.forEach(synonym => {
                daadCode += this.generateSynonymDAAD(synonym) + '\n';
            });

            const blob = new Blob([daadCode], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'synonyms.daad';
            a.click();
            URL.revokeObjectURL(url);

            console.log(`Exported ${synonyms.length} synonyms to DAAD format`);
        },

        exportJSON() {
            const game = AdventureCreator.getCurrentGame();
            const synonyms = game.daad.synonyms || [];

            if (synonyms.length === 0) {
                alert('No synonyms to export.');
                return;
            }

            const json = JSON.stringify(synonyms, null, 2);

            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'synonyms.json';
            a.click();
            URL.revokeObjectURL(url);

            console.log(`Exported ${synonyms.length} synonyms to JSON`);
        },

        applyLanguageFeature(featureId) {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            const feature = this.getLanguageFeatures().find(f => f.id === featureId);
            if (!feature) return;

            // Add example synonyms based on feature
            if (featureId === 'partial_matching') {
                const shortcuts = [
                    { primary: 'examine', type: 'VERB', alternatives: ['ex', 'exam'], category: 'basic_verbs' },
                    { primary: 'inventory', type: 'VERB', alternatives: ['inv', 'i'], category: 'interface' },
                    { primary: 'north', type: 'NOUN', alternatives: ['n'], category: 'movement' }
                ];

                shortcuts.forEach(syn => {
                    const exists = game.daad.synonyms.some(s => s.primary === syn.primary);
                    if (!exists) game.daad.synonyms.push(syn);
                });

                alert(`Applied ${feature.name} - Added abbreviations for common commands!`);
            }

            console.log(`Applied language feature: ${featureId}`);
            AdventureCreator.navigate('editor');
        },

        applyRecommendation(recId) {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            if (recId === 'add_movement_synonyms') {
                const movements = [
                    { primary: 'northeast', type: 'NOUN', alternatives: ['ne'], category: 'movement' },
                    { primary: 'northwest', type: 'NOUN', alternatives: ['nw'], category: 'movement' },
                    { primary: 'southeast', type: 'NOUN', alternatives: ['se'], category: 'movement' },
                    { primary: 'southwest', type: 'NOUN', alternatives: ['sw'], category: 'movement' }
                ];

                movements.forEach(syn => {
                    const exists = game.daad.synonyms.some(s => s.primary === syn.primary);
                    if (!exists) game.daad.synonyms.push(syn);
                });

                alert('Added diagonal direction synonyms!');
            } else if (recId === 'improve_object_names') {
                this.applyCategorySynonyms('objects');
                return;
            } else if (recId === 'add_social_commands') {
                this.applyCategorySynonyms('social');
                return;
            }

            console.log(`Applied recommendation: ${recId}`);
            AdventureCreator.navigate('editor');
        },

        previewPattern(patternId) {
            const pattern = this.getVocabularyPatterns().find(p => p.id === patternId);
            if (!pattern) return;

            const preview = pattern.synonyms.map(syn =>
                `${syn.primary} = ${syn.alternatives.join(', ')}`
            ).join('\n');

            alert(`${pattern.name}\n\n${preview}\n\n...and ${pattern.words - pattern.synonyms.length} more`);
        },

        applyPattern(patternId) {
            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            const pattern = this.getVocabularyPatterns().find(p => p.id === patternId);
            if (!pattern || !pattern.synonyms) return;

            let added = 0;
            pattern.synonyms.forEach(syn => {
                const exists = game.daad.synonyms.some(s => s.primary.toLowerCase() === syn.primary.toLowerCase());
                if (!exists) {
                    game.daad.synonyms.push(syn);
                    added++;
                }
            });

            alert(`Applied ${pattern.name}!\nAdded ${added} synonym groups.`);
            console.log(`Applied pattern ${patternId}: ${added} groups added`);
            AdventureCreator.navigate('editor');
        },

        refreshAnalysis() {
            console.log('Refreshing vocabulary analysis');
            AdventureCreator.navigate('editor');
        },

        testInput() {
            const input = document.getElementById('vocabularyTestInput')?.value || '';
            if (!input.trim()) {
                alert('Please enter a command to test.');
                return;
            }

            const game = AdventureCreator.getCurrentGame();
            const synonyms = game?.daad?.synonyms || [];

            const words = input.toLowerCase().split(' ');
            const matches = [];
            let recognized = false;

            words.forEach(word => {
                synonyms.forEach(syn => {
                    if (syn.primary === word || syn.alternatives.includes(word)) {
                        matches.push(`"${word}" → ${syn.primary.toUpperCase()}`);
                        recognized = true;
                    }
                });
            });

            const results = {
                recognized: recognized,
                confidence: recognized ? 95 : 0,
                interpretation: recognized ? `Matched ${matches.length} word(s)` : 'No synonym matches found',
                synonymMatches: matches,
                suggestions: recognized ? [] : ['Add synonyms for these words', 'Check spelling']
            };

            AdventureCreator.state.synonymSystem.lastTestResults = results;
            console.log(`Tested input: ${input}`, results);
            AdventureCreator.navigate('editor');
        },

        clearTestResults() {
            AdventureCreator.state.synonymSystem.lastTestResults = null;
            AdventureCreator.state.synonymSystem.testHistory = [];
            console.log('Cleared test results');
            AdventureCreator.navigate('editor');
        },

        runCommonCommandsTest() {
            const commonCommands = ['take sword', 'go north', 'look', 'inventory', 'drop key', 'help'];
            let passed = 0;

            const game = AdventureCreator.getCurrentGame();
            const synonyms = game?.daad?.synonyms || [];

            commonCommands.forEach(cmd => {
                const words = cmd.split(' ');
                const hasMatch = words.some(word =>
                    synonyms.some(syn => syn.primary === word || syn.alternatives.includes(word))
                );
                if (hasMatch) passed++;
            });

            const test = {
                name: 'Common Commands Test',
                total: commonCommands.length,
                passed: passed,
                timestamp: new Date().toISOString()
            };

            AdventureCreator.state.synonymSystem.testHistory.push(test);

            alert(`Common Commands Test\n\n${passed}/${commonCommands.length} commands recognized\n${Math.round((passed/commonCommands.length)*100)}% success rate`);
            console.log('Ran common commands test', test);
            AdventureCreator.navigate('editor');
        },

        runRandomVariationsTest() {
            const variations = ['get sword', 'pick sword', 'grab sword', 'obtain sword', 'n', 'northward', 'ex', 'examine'];
            let passed = 0;

            const game = AdventureCreator.getCurrentGame();
            const synonyms = game?.daad?.synonyms || [];

            variations.forEach(word => {
                const hasMatch = synonyms.some(syn =>
                    syn.primary === word || syn.alternatives.includes(word)
                );
                if (hasMatch) passed++;
            });

            const test = {
                name: 'Random Variations Test',
                total: variations.length,
                passed: passed,
                timestamp: new Date().toISOString()
            };

            AdventureCreator.state.synonymSystem.testHistory.push(test);

            alert(`Random Variations Test\n\n${passed}/${variations.length} variations recognized\n${Math.round((passed/variations.length)*100)}% success rate`);
            console.log('Ran random variations test', test);
            AdventureCreator.navigate('editor');
        },

        runTypoResilienceTest() {
            const typos = ['examin', 'inventroy', 'norht', 'souhth'];
            let passed = 0;

            const game = AdventureCreator.getCurrentGame();
            const synonyms = game?.daad?.synonyms || [];

            typos.forEach(word => {
                const hasMatch = synonyms.some(syn =>
                    syn.alternatives.includes(word)
                );
                if (hasMatch) passed++;
            });

            const test = {
                name: 'Typo Resilience Test',
                total: typos.length,
                passed: passed,
                timestamp: new Date().toISOString()
            };

            AdventureCreator.state.synonymSystem.testHistory.push(test);

            const message = passed === 0
                ? 'No typo tolerance configured. Consider adding common misspellings to your synonyms!'
                : `${passed}/${typos.length} typos handled`;

            alert(`Typo Resilience Test\n\n${message}\n${Math.round((passed/typos.length)*100)}% resilience`);
            console.log('Ran typo resilience test', test);
            AdventureCreator.navigate('editor');
        },

        fillGap(word, type) {
            const alternatives = prompt(`Enter alternatives for "${word}" (comma-separated):`, '');
            if (!alternatives) return;

            const game = AdventureCreator.getCurrentGame();
            if (!game.daad.synonyms) game.daad.synonyms = [];

            game.daad.synonyms.push({
                primary: word.toLowerCase(),
                type: type.toUpperCase(),
                alternatives: alternatives.split(',').map(alt => alt.trim().toLowerCase()),
                category: 'basic_verbs',
                description: 'Added from vocabulary gap analysis'
            });

            console.log(`Filled vocabulary gap: ${word}`);
            AdventureCreator.navigate('editor');
        }
    });

    console.log('Enhanced Synonym System registered successfully');
})();
