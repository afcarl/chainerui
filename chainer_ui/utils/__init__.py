# -*- coding: utf-8 -*-

''' util.py '''

import os
import json

from chainer_ui import DB_SESSION
from chainer_ui.models.result import Result
from chainer_ui.models.log import Log
from chainer_ui.models.argument import Argument
from chainer_ui.models.command import Command
from chainer_ui.models.snapshot import Snapshot


def explore_log_file(result_path, log_file_name):
    ''' explore_log_file '''
    log_path = os.path.join(result_path, log_file_name)

    log = []
    if os.path.isfile(log_path):
        with open(log_path) as json_data:
            log = json.load(json_data)

    return log


def explore_result_dir(path):
    ''' explore_result_dir '''
    result = {
        'logs': [],
        'args': [],
        'commands': [],
        'snapshots': []
    }

    if os.path.isdir(path):
        result['logs'] = explore_log_file(path, 'log')
        result['args'] = explore_log_file(path, 'args')
        result['commands'] = explore_log_file(path, 'commands')
        result['snapshots'] = [
            x for x in os.listdir(path) if x.count('snapshot_iter_')
        ]

    return result


def crawl_result_table():
    ''' crawl_result_table '''

    for result in DB_SESSION.query(Result).all():
        crawl_result = explore_result_dir(result.path_name)

        if result.args is None:
            result.args = Argument(json.dumps(crawl_result['args']))

        if len(result.logs) < len(crawl_result['logs']):
            for log in crawl_result['logs'][len(result.logs):]:
                result.logs.append(Log(json.dumps(log)))

        result.commands = [
            Command(cmd['name'], json.dumps(cmd['body'], indent=4))
            for cmd in crawl_result['commands']
        ]

        result.snapshots = [
            Snapshot(s, int(s.split('snapshot_iter_')[1]))
            for s in crawl_result['snapshots']
        ]

        DB_SESSION.commit()
