#!/usr/bin/env node

/**
 * Increment Idea Script
 * Usage: node increment-idea.js <idea-id> [increment-amount]
 * 
 * Examples:
 *   node increment-idea.js dunning-kruger        // Increments by 1
 *   node increment-idea.js compound-interest 5   // Increments by 5
 *   node increment-idea.js --list               // Lists all idea IDs
 */

import fs from 'fs';
import path from 'path';

const DATA_FILE = 'src/data/recurring-ideas.js';

function getCurrentTimestamp() {
    return new Date().toISOString().split('T')[0];
}

function readIdeasFile() {
    try {
        const content = fs.readFileSync(DATA_FILE, 'utf8');
        // Extract the array from the export statement
        const arrayMatch = content.match(/export const recurringIdeas = (\[[\s\S]*?\]);/);
        if (!arrayMatch) {
            throw new Error('Could not parse ideas array from file');
        }
        
        // Use eval to parse the array (in a real production app, you'd want a proper parser)
        const ideasArray = eval(arrayMatch[1]);
        return { content, ideasArray, originalArray: arrayMatch[1] };
    } catch (error) {
        console.error('Error reading ideas file:', error.message);
        process.exit(1);
    }
}

function writeIdeasFile(content, newArrayString) {
    try {
        const newContent = content.replace(
            /export const recurringIdeas = \[[\s\S]*?\];/,
            `export const recurringIdeas = ${newArrayString};`
        );
        fs.writeFileSync(DATA_FILE, newContent);
        return true;
    } catch (error) {
        console.error('Error writing ideas file:', error.message);
        return false;
    }
}

function formatIdeasArray(ideas) {
    const indent = '  ';
    const itemIndent = '    ';
    
    const formattedItems = ideas.map(idea => {
        const props = [
            `id: "${idea.id}"`,
            `title: "${idea.title}"`,
            `description: "${idea.description.replace(/"/g, '\\"')}"`,
            `url: "${idea.url}"`,
            `votes: ${idea.votes}`,
            `category: "${idea.category}"`,
            `tags: [${idea.tags.map(tag => `"${tag}"`).join(', ')}]`,
            `dateAdded: "${idea.dateAdded}"`,
            `lastIncremented: "${idea.lastIncremented}"`,
            `personalNotes: "${idea.personalNotes.replace(/"/g, '\\"')}"`
        ];
        
        const formattedProps = props.map(prop => `${itemIndent}${prop}`).join(',\n');
        return `${indent}{\n${formattedProps}\n${indent}}`;
    });
    
    return `[\n${formattedItems.join(',\n')}\n]`;
}

function listAllIdeas(ideas) {
    console.log('\n📝 All Available Idea IDs:');
    console.log('=' .repeat(50));
    
    ideas
        .sort((a, b) => b.votes - a.votes)
        .forEach((idea, index) => {
            console.log(`${(index + 1).toString().padStart(2)}. ${idea.id.padEnd(20)} (${idea.votes} votes) - ${idea.title}`);
        });
    
    console.log(`\nTotal: ${ideas.length} ideas`);
}

function incrementIdea(ideaId, increment = 1) {
    const { content, ideasArray } = readIdeasFile();
    
    // Find the idea
    const ideaIndex = ideasArray.findIndex(idea => idea.id === ideaId);
    
    if (ideaIndex === -1) {
        console.error(`❌ Idea with ID "${ideaId}" not found.`);
        console.log('\nAvailable IDs:');
        ideasArray.forEach(idea => console.log(`  - ${idea.id}`));
        process.exit(1);
    }
    
    const idea = ideasArray[ideaIndex];
    const oldVotes = idea.votes;
    
    // Update the idea
    idea.votes += increment;
    idea.lastIncremented = getCurrentTimestamp();
    
    // Format and write back to file
    const newArrayString = formatIdeasArray(ideasArray);
    
    if (writeIdeasFile(content, newArrayString)) {
        console.log(`✅ Successfully updated "${idea.title}"`);
        console.log(`   Votes: ${oldVotes} → ${idea.votes} (+${increment})`);
        console.log(`   Last incremented: ${idea.lastIncremented}`);
        
        // Show new ranking
        const sortedIdeas = [...ideasArray].sort((a, b) => b.votes - a.votes);
        const newRank = sortedIdeas.findIndex(i => i.id === ideaId) + 1;
        console.log(`   New ranking: #${newRank}`);
    } else {
        console.error('❌ Failed to update file');
        process.exit(1);
    }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
📊 Increment Idea Script

Usage:
  node increment-idea.js <idea-id> [increment-amount]
  node increment-idea.js --list

Examples:
  node increment-idea.js dunning-kruger        # Increment by 1
  node increment-idea.js compound-interest 5   # Increment by 5
  node increment-idea.js --list               # Show all idea IDs

Options:
  --list, -l    List all available idea IDs with current vote counts
  --help, -h    Show this help message
`);
    process.exit(0);
}

if (args[0] === '--list' || args[0] === '-l') {
    const { ideasArray } = readIdeasFile();
    listAllIdeas(ideasArray);
    process.exit(0);
}

const ideaId = args[0];
const increment = args[1] ? parseInt(args[1]) : 1;

if (isNaN(increment) || increment <= 0) {
    console.error('❌ Increment amount must be a positive number');
    process.exit(1);
}

incrementIdea(ideaId, increment);