// index.tsx

import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import TokenList from '@/components/TokenList';
import SearchFilter from '@/components/SearchFilter';
import HowItWorksPopup from '@/components/HowItWorksPopup';
import SortOptions, { SortOption } from '@/components/SortOptions';
import { getAllTokens, getTokensWithLiquidity, getRecentTokens, searchTokens } from '@/utils/api';
import { Token, TokenWithLiquidityEvents, PaginatedResponse } from '@/interface/types';

const TOKENS_PER_PAGE = 10;

const Home: React.FC = () => {
  const [tokens, setTokens] = useState<PaginatedResponse<Token | TokenWithLiquidityEvents> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<SortOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [noRecentTokens, setNoRecentTokens] = useState(false);

  useEffect(() => {
    console.log('Effect triggered. Current sort:', sort, 'Current page:', currentPage);
    fetchTokens();
  }, [currentPage, sort, searchQuery]);

  const fetchTokens = async () => {
    setIsLoading(true);
    setNoRecentTokens(false);
    let fetchedTokens;

    try {
      if (searchQuery) {
        fetchedTokens = await searchTokens(searchQuery, currentPage, TOKENS_PER_PAGE);
      } else {
        switch (sort) {
          case 'all':
            fetchedTokens = await getAllTokens(currentPage, TOKENS_PER_PAGE);
            break;
          case 'recentCreated':
            fetchedTokens = await getRecentTokens(currentPage, TOKENS_PER_PAGE, 1);
            if (fetchedTokens === null) {
              setNoRecentTokens(true);
              fetchedTokens = { data: [], totalCount: 0, currentPage: 1, totalPages: 1 };
            }
            break;
          case 'ended':
            fetchedTokens = await getTokensWithLiquidity(currentPage, TOKENS_PER_PAGE);
            break;
          case 'bomper':
            fetchedTokens = {
              data: [],
              totalCount: 0,
              currentPage: 1,
              totalPages: 1
            };
            break;
          default:
            fetchedTokens = await getAllTokens(currentPage, TOKENS_PER_PAGE);
        }
      }

      const adjustedTokens: PaginatedResponse<Token | TokenWithLiquidityEvents> = {
        data: fetchedTokens.data || fetchedTokens.tokens || [],
        totalCount: fetchedTokens.totalCount,
        currentPage: fetchedTokens.currentPage || 1,
        totalPages: fetchedTokens.totalPages || 1,
        tokens: []
      };

      setTokens(adjustedTokens);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      // Handle other types of errors here
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTokens = useMemo(() => {
    if (!tokens || !tokens.data) return [];
    return tokens.data.filter(token => 
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tokens, searchQuery]);

  const handleSearch = (query: string) => {
    console.log('Search query updated:', query);
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSort = (option: SortOption) => {
    console.log('Sort option changed:', option);
    setSort(option);
    setCurrentPage(1);
    setSearchQuery(''); // Clear search query when sorting
  };

  const handlePageChange = (page: number) => {
    console.log('Page changed:', page);
    setCurrentPage(page);
  };

  return (
    <Layout>
      <HowItWorksPopup />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-400 mb-6">Explore Tokens</h1>
        <SearchFilter onSearch={handleSearch} />
        <SortOptions onSort={handleSort} currentSort={sort} />
        {isLoading ? (
          <div className="text-center text-white text-xl mt-10">Loading...</div>
        ) : sort === 'bomper' ? (
          <div className="text-center text-white text-xl mt-10">NOTHING HERE FOR YOU</div>
        ) : noRecentTokens ? (
          <div className="text-center text-white text-xl mt-10">No tokens created in the last hour. Check back soon.</div>
        ) : filteredTokens.length > 0 ? (
          <TokenList
            tokens={filteredTokens}
            currentPage={currentPage}
            totalPages={tokens?.totalPages || 1}
            onPageChange={handlePageChange}
            isEnded={sort === 'ended'}
          />
        ) : (
          <div className="text-center text-white text-xl mt-10">No tokens found matching your criteria.</div>
        )}
      </div>
    </Layout>
  );
};

export default Home;