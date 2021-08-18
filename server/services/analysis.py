"""
Runs machine learning based analysis on songs.
"""

import json
import numpy as np

from core import Clusters

def extract_data(data):
    return np.array([
        data['danceability'],
        data['energy'],
        data['speechiness'],
        data['acousticness'],
        data['instrumentalness'],
        data['liveness'],
        data['valence'],
        data['tempo']
    ])

def preprocess(data):
    mean = data.mean(axis = 0)
    std = data.std(axis = 0)
    
    return (data - mean) / std

def main():
    song_data_raw = input()   
    song_data = json.loads(song_data_raw) 
    
    if not len(song_data['songs']) - 1:  # edge case for just one song
        print(json.dumps({
            'song_scores': [
                {
                    'score': 100,
                    'cluster': 1,
                    'uri': song_data['songs'][0]['uri']
                }
            ]
        }), flush = True)
        return
    
    if not len(song_data['songs']) - 2:  # edge case for just two songs
        print(json.dumps({
            'song_scores': [
                {
                    'score': 100,
                    'cluster': 1,
                    'uri': song_data['songs'][0]['uri']
                },
                {
                    'score': 0,
                    'cluster': 1,
                    'uri': song_data['songs'][1]['uri']
                }
            ]
        }), flush = True)
        return

    # must be at least 3 songs...
    extracted_data = np.array([extract_data(song['features']) for song in song_data['songs']])
    preprocessed_data = np.array([preprocess(data) for data in extracted_data])
    song_ids = np.array([song['uri'] for song in song_data['songs']])
    clusters = Clusters(preprocessed_data)
    
    d, s = clusters.orderedData, clusters.orderedScores
    extracted_mean, extracted_std = extracted_data.mean(axis = 0), extracted_data.std(axis = 0)
    
    transformed_d = d * extracted_std + extracted_mean
    original_data = preprocessed_data * extracted_std + extracted_mean
    
    centroid_data = [points * extracted_std + extracted_mean for _, points in clusters.items()]
    
    output = {'song_scores': []}
    
    for i, features in enumerate(original_data):
        score = None
        cluster = None
        
        for j, cluster_features in enumerate(transformed_d):
            if np.all(features == cluster_features):
                score = s[j]
                break
                
        for j, cluster_data in enumerate(centroid_data):
            for k, cluster_features in enumerate(cluster_data):
                if np.all(features == cluster_features):
                    cluster = j + 1
                    break
            if cluster is not None: break
            
        assert not score is None
        assert not cluster is None
        
        assert type(score) in {int, float, np.float64}, f'type(score) = {type(score)}'
        assert type(cluster) in {int, float, np.float64}, f'type(cluster) = {type(cluster)}'
        
        output['song_scores'].append({
            'score': score,
            'cluster': cluster,
            'uri': song_data['songs'][i]['uri']
        })
    
    
    print(json.dumps(output), flush = True)

if __name__ == '__main__':
    main()
