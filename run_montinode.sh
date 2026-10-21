#!/usr/bin/env bash
node "$HOME/io.montinode/engine/montinode_builder.mjs"
node --input-type=module -e "import { executeNodeSynthesis } from './io.montinode/engine/compiled_node_core.js'; executeNodeSynthesis();"
