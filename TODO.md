 - Currently the dom is updated and appended to as opposed to re-rendered upon
   data changes.  This happens to be more performant, but not at all worth the
   complexity and I simply didn't think of the correct design up front.  So
   in the case of a rewrite, there should be view elements that hold json data
   representing the raw data held on the server as well as their own view-state
   and a nunjucks template taking both.  If either the data or view-state is
   modified, then a re-render would trigger.  I would have to test how fast
   the re-render is given large data on low-cpu environments, but performance
   is probably a non-issue.
