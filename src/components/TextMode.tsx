
import React, { useState } from 'react';
import { Plus, MapPin, Clock, Heart, MessageCircle } from 'lucide-react';
import PostCreationModal from './PostCreationModal';

const TextMode = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock post data
  const mockPosts = [
    {
      id: 1,
      type: 'social',
      author: '익명',
      content: '이 카페 진짜 분위기 좋다! 작업하기 딱이야 ☕️',
      timeLeft: '23시간 15분',
      likes: 12,
      comments: 3,
      distance: '15m',
      visibility: 'public'
    },
    {
      id: 2,
      type: 'info',
      author: '레벨 3 사용자',
      content: '여기 주차 어려워요. 근처 공영주차장 이용하세요!',
      timeLeft: '8시간 42분',
      likes: 28,
      comments: 7,
      distance: '32m',
      visibility: 'public'
    },
    {
      id: 3,
      type: 'nonverbal',
      author: '익명',
      content: '🎵 이 노래 좋다... (음성에서 변환됨)',
      timeLeft: '4시간 18분',
      likes: 5,
      comments: 1,
      distance: '68m',
      visibility: 'friends'
    }
  ];

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'info-post';
      case 'social': return 'social-post';
      case 'nonverbal': return 'nonverbal-post';
      default: return 'other-post';
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'public': return '공개';
      case 'friends': return '친구';
      case 'private': return '비공개';
      default: return '공개';
    }
  };

  return (
    <div className="text-mode animate-fade-in">
      <div className="container max-w-md mx-auto px-4 pt-20 pb-24">
        {/* Map placeholder */}
        <div className="map-container h-64 mb-6 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-primary" />
            <p className="korean-text">지도 영역</p>
            <p className="text-sm text-gray-500">근처 게시물들이 표시됩니다</p>
          </div>
        </div>

        {/* Nearby posts */}
        <div className="space-y-4">
          <h2 className="text-korean-xl font-bold text-gray-800 mb-4">근처 게시물</h2>
          
          {mockPosts.map((post) => (
            <div key={post.id} className={`post-card ${getPostTypeColor(post.type)}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">{post.author}</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {getVisibilityText(post.visibility)}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{post.distance}</span>
                </div>
              </div>
              
              <p className="korean-text text-gray-800 mb-3 leading-relaxed">
                {post.content}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{post.timeLeft}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fab animate-scale-in"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Post Creation Modal */}
      <PostCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default TextMode;
