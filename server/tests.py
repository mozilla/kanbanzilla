import unittest
from datetime import datetime

from api import sort_bugs


def bug(id, **kw):
    res = {
        'id': id,
        'assigned_to': '',
        'target_milestone': '',
        'last_change_time': datetime.now(),
        'whiteboard': '',
        'status': 'NEW',
        'summary': '',
        'component': ''
    }
    res.update(**kw)
    return res


class TestBugs(unittest.TestCase):

    def bugs_in(self, result, name, *ids):
        for column in result[0]:
            if column['name'] == name:
                return set(ids) == set([i['id'] for i in column['bugs']])

        raise ValueError('Column %s not found' % name)


    def test_new(self):
        bugs = sort_bugs([bug(1)])
        assert self.bugs_in(bugs, 'Backlog', 1)

    def test_assigned_milestone(self):
        bugs = sort_bugs([bug(1, assigned_to='andy', target_milestone='yes')])
        assert self.bugs_in(bugs, 'Working on', 1)

    def test_assigned(self):
        bugs = sort_bugs([bug(1, status='ASSIGNED')])
        assert self.bugs_in(bugs, 'Working on', 1)

    def test_resolved(self):
        bugs = sort_bugs([bug(1, status='RESOLVED')])
        assert self.bugs_in(bugs, 'Testing', 1)

    def test_testing(self):
        bugs = sort_bugs([bug(1, whiteboard='kanbanzilla[Review]')])
        assert self.bugs_in(bugs, 'Review', 1)

    def test_resolved_over_testing(self):
        bugs = sort_bugs([bug(1, status='RESOLVED',
                              whiteboard='kanbanzilla[Review]')])
        assert self.bugs_in(bugs, 'Testing', 1)


if __name__=='__main__':
    unittest.main()
